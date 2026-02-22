import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { liveClassAPI } from '../services/api';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Users, X, Loader2, ExternalLink, ArrowLeft
} from 'lucide-react';

interface Peer {
  socketId: string;
  userId: string;
  userName: string;
  stream?: MediaStream;
  pc?: RTCPeerConnection;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const VideoCallPage: React.FC<{ navigate: (r: string) => void; courseId?: string }> = ({ navigate, courseId }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [roomId, setRoomId] = useState(courseId || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveClass, setLiveClass] = useState<any>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [platform, setPlatform] = useState('Zoom');
  const [isLoading, setIsLoading] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Peer[]>([]);

  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  // Load live class data for students
  useEffect(() => {
    if (courseId && !isInstructor) {
      loadLiveClass();
    } else {
      setIsLoading(false);
    }
  }, [courseId, isInstructor]);

  const loadLiveClass = async () => {
    try {
      const res = await liveClassAPI.getByCourse(courseId!);
      setLiveClass(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstructorGoLive = async () => {
    if (!meetingLink || !courseId) return alert('Please enter a meeting link');
    setIsConnecting(true);
    try {
      await liveClassAPI.create({ courseId, meetingLink, platform });
      alert('Live class started! Students can now join.');
      navigate('dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start live class');
    } finally {
      setIsConnecting(false);
    }
  };

  const createPeerConnection = useCallback((targetSocketId: string, targetUserId: string, targetUserName: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          target: targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setPeers(prev => {
        const updated = prev.map(p => {
          if (p.socketId === targetSocketId) {
            return { ...p, stream: remoteStream };
          }
          return p;
        });
        return updated;
      });
      peersRef.current = peersRef.current.map(p => {
        if (p.socketId === targetSocketId) {
          return { ...p, stream: remoteStream };
        }
        return p;
      });
    };

    const newPeer: Peer = { socketId: targetSocketId, userId: targetUserId, userName: targetUserName, pc };
    peersRef.current.push(newPeer);
    setPeers([...peersRef.current]);

    return pc;
  }, [socket]);

  const joinRoom = async () => {
    if (!roomId || !socket) return;
    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join the video room
      socket.emit('join-video-room', {
        roomId,
        userId: user!.id,
        userName: user!.name
      });

      setIsJoined(true);
    } catch (err) {
      console.error('Error accessing media:', err);
      // Try video-only or audio-only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        socket.emit('join-video-room', { roomId, userId: user!.id, userName: user!.name });
        setIsJoined(true);
      } catch {
        alert('Unable to access camera or microphone. Please check permissions.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!socket || !isJoined) return;

    // When existing participants are in the room
    socket.on('existing-participants', async (participants: any[]) => {
      for (const p of participants) {
        const pc = createPeerConnection(p.socketId, p.userId, p.userName);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', {
            target: p.socketId,
            sdp: offer,
            callerUserId: user!.id,
            callerUserName: user!.name
          });
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      }
    });

    // When a new user joins
    socket.on('user-joined', (data: any) => {
      console.log('User joined:', data.userName);
      // We'll wait for their offer
    });

    // Receive offer
    socket.on('offer', async (data: any) => {
      const pc = createPeerConnection(data.caller, data.callerUserId, data.callerUserName);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: data.caller, sdp: answer });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    // Receive answer
    socket.on('answer', async (data: any) => {
      const peer = peersRef.current.find(p => p.socketId === data.answerer);
      if (peer?.pc) {
        try {
          await peer.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } catch (err) {
          console.error('Error setting answer:', err);
        }
      }
    });

    // Receive ICE candidate
    socket.on('ice-candidate', async (data: any) => {
      const peer = peersRef.current.find(p => p.socketId === data.from);
      if (peer?.pc) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    // User left
    socket.on('user-left', (data: any) => {
      const peer = peersRef.current.find(p => p.socketId === data.socketId);
      if (peer?.pc) peer.pc.close();
      peersRef.current = peersRef.current.filter(p => p.socketId !== data.socketId);
      setPeers([...peersRef.current]);
    });

    return () => {
      socket.off('existing-participants');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-left');
    };
  }, [socket, isJoined, createPeerConnection, user]);

  const leaveRoom = () => {
    if (socket && roomId) {
      socket.emit('leave-video-room', { roomId });
    }
    // Close all peer connections
    peersRef.current.forEach(p => p.pc?.close());
    peersRef.current = [];
    setPeers([]);

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setIsJoined(false);
    navigate('dashboard');
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => { track.enabled = !track.enabled; });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => { track.enabled = !track.enabled; });
      setIsCamOn(!isCamOn);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket && roomId && isJoined) {
        socket.emit('leave-video-room', { roomId });
      }
      peersRef.current.forEach(p => p.pc?.close());
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Pre-join screen for instructor
  if (isInstructor && !isJoined) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
          <button onClick={() => navigate('dashboard')} className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <Video className="w-16 h-16 text-violet-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Go Live</h2>
          <p className="text-slate-500 mb-6 text-center">Enter meeting link to start live class</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Meeting Link</label>
              <input
                type="url"
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Platform</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              onClick={handleInstructorGoLive}
              disabled={!meetingLink || isConnecting}
              className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConnecting ? <><Loader2 className="w-5 h-5 animate-spin" /> Starting...</> : 'Start Live Class'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Student view - show meeting link
  if (!isInstructor) {
    if (isLoading) {
      return (
        <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md text-center">
          <button onClick={() => navigate('dashboard')} className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          {liveClass ? (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Class Active</h2>
              <p className="text-slate-500 mb-6">Instructor has added this meeting link:</p>
              <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
                <p className="text-sm font-mono text-slate-700 break-all">{liveClass.meetingLink}</p>
                <p className="text-xs text-slate-500 mt-2">Platform: {liveClass.platform}</p>
              </div>
              <a
                href={liveClass.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" /> Join Live Class
              </a>
            </>
          ) : (
            <>
              <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Live Class</h2>
              <p className="text-slate-500 mb-6">There is no active live class at the moment.</p>
              <button
                onClick={() => navigate('dashboard')}
                className="w-full bg-slate-600 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-all"
              >
                Back to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] bg-slate-900 rounded-3xl overflow-hidden relative flex flex-col shadow-2xl">
      {/* Video Grid */}
      <div className="flex-1 p-4 grid gap-4" style={{
        gridTemplateColumns: `repeat(${Math.min(peers.length + 1, 3)}, 1fr)`,
        gridAutoRows: '1fr'
      }}>
        {/* Local Video */}
        <div className="relative bg-slate-800 rounded-2xl overflow-hidden border-2 border-indigo-500/30">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${!isCamOn ? 'hidden' : ''}`}
          />
          {!isCamOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-400">{user?.name[0]}</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-lg">
            <span className="text-white text-xs font-bold">You</span>
            {isMicOn ? <Mic className="w-3 h-3 text-indigo-400" /> : <MicOff className="w-3 h-3 text-red-500" />}
          </div>
        </div>

        {/* Remote Peers */}
        {peers.map((peer) => (
          <div key={peer.socketId} className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
            {peer.stream ? (
              <VideoElement stream={peer.stream} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-400">{peer.userName?.[0] || '?'}</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-lg">
              <span className="text-white text-xs font-bold">{peer.userName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="h-24 flex items-center justify-center gap-4 px-8 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        <button
          onClick={toggleCam}
          className={`p-4 rounded-2xl transition-all ${isCamOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
          {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-3 rounded-2xl">
          <Users className="w-5 h-5 text-indigo-400" />
          <span className="text-white text-sm font-bold">{peers.length + 1}</span>
        </div>
        <button
          onClick={leaveRoom}
          className="p-4 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/20"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Helper component for remote video
const VideoElement: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
};

export default VideoCallPage;
