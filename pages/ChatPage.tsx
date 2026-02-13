import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messagesAPI, coursesAPI } from '../services/api';
import { Send, Loader2, MessageSquare, Video } from 'lucide-react';

const ChatPage: React.FC<{ navigate: (r: string, p?: any) => void; initialRoomId?: string }> = ({ navigate, initialRoomId }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentRoom, setCurrentRoom] = useState(initialRoomId || '');
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevRoomRef = useRef<string>('');

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      loadMessages(currentRoom);
      if (socket) {
        if (prevRoomRef.current) {
          socket.emit('leave-room', prevRoomRef.current);
        }
        socket.emit('join-room', currentRoom);
        prevRoomRef.current = currentRoom;
      }
    }
  }, [currentRoom, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (data: any) => {
      if (data.roomId === currentRoom) {
        setMessages(prev => [...prev, data]);
      }
    };
    socket.on('receive-message', handleMessage);
    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [socket, currentRoom]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRooms = async () => {
    try {
      // Load courses as chat rooms
      const res = await coursesAPI.getAll();
      const courseRooms = res.data.map((c: any) => ({
        id: c._id,
        name: c.title,
        lastMessage: 'Course chat',
        time: ''
      }));
      setRooms(courseRooms);
      if (!currentRoom && courseRooms.length > 0) {
        setCurrentRoom(courseRooms[0].id);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const res = await messagesAPI.getHistory(roomId);
      setMessages(res.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket || !currentRoom) return;
    socket.emit('send-message', {
      senderId: user!.id,
      senderName: user!.name,
      text: inputText,
      roomId: currentRoom
    });
    setInputText('');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Sidebar: Chat Rooms */}
      <div className="hidden md:flex flex-col w-80 border-r border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold mb-2">Messages</h2>
          <p className="text-xs text-slate-500">
            {isConnected ? (
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Connected</span>
            ) : (
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Disconnected</span>
            )}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setCurrentRoom(room.id)}
              className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${currentRoom === room.id ? 'bg-indigo-50/50 border-r-2 border-indigo-600' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{room.name}</h4>
                <p className="text-xs text-slate-500 truncate">{room.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">
                {rooms.find(r => r.id === currentRoom)?.name || 'Select a chat'}
              </h3>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                {messages.length} messages
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('video', { courseId: currentRoom })}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
            title="Start video call"
          >
            <Video className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg._id || idx} className={`flex ${msg.sender === user?.id || msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${msg.sender === user?.id || msg.senderId === user?.id
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                  {msg.sender !== user?.id && msg.senderId !== user?.id && (
                    <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-2 ${msg.sender === user?.id || msg.senderId === user?.id ? 'text-indigo-200' : 'text-slate-400'
                    } text-right`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef}></div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={currentRoom ? "Type your message..." : "Select a chat room first"}
              disabled={!currentRoom}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!currentRoom || !inputText.trim()}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
