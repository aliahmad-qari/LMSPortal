import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Download } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  onDownload?: () => void;
}

/**
 * VideoPlayer Component
 * 
 * A reusable HTML5 video player with custom controls
 * Supports fullscreen, volume control, and playback speed
 * 
 * Usage:
 * <VideoPlayer 
 *   url="https://cloudinary.com/video.mp4"
 *   title="Lesson 1: Introduction"
 *   poster="https://cloudinary.com/poster.jpg"
 * />
 */

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, poster, onDownload }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current?.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
            {/* Video Container */}
            <div className="relative bg-black aspect-video">
                <video
                    ref={videoRef}
                    src={url}
                    poster={poster}
                    className="w-full h-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />

                {/* Play Button Overlay */}
                {!isPlaying && (
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
                    >
                        <Play className="w-16 h-16 text-white fill-white" />
                    </button>
                )}
            </div>

            {/* Title */}
            {title && (
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
                    <h3 className="text-white font-bold text-sm">{title}</h3>
                </div>
            )}

            {/* Controls */}
            <div className="bg-slate-900 p-4 space-y-3">
                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 min-w-10">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleTimeChange}
                        className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                    <span className="text-xs text-slate-400 min-w-10">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-white"
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5 fill-white" />
                            )}
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group">
                            <button
                                onClick={toggleMute}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-white"
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover:w-20 transition-all h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                            />
                        </div>

                        {/* Playback Speed */}
                        <div className="flex items-center gap-1">
                            {[0.5, 1, 1.5, 2].map(rate => (
                                <button
                                    key={rate}
                                    onClick={() => handlePlaybackRateChange(rate)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        playbackRate === rate
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Download Button */}
                        {onDownload && (
                            <button
                                onClick={onDownload}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-white"
                                title="Download"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        )}

                        {/* Fullscreen */}
                        <button
                            onClick={handleFullscreen}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-white"
                            title="Fullscreen"
                        >
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;

/**
 * USAGE EXAMPLES
 * 
 * 1. Basic video player:
 * 
 *    <VideoPlayer url="https://cloudinary.com/video.mp4" />
 * 
 * 2. With title and poster:
 * 
 *    <VideoPlayer 
 *      url="https://cloudinary.com/video.mp4"
 *      title="Lesson 1: Introduction to React"
 *      poster="https://cloudinary.com/poster.jpg"
 *    />
 * 
 * 3. In a lesson viewer:
 * 
 *    const LessonViewer = ({ lesson }) => {
 *      if (lesson.type === 'video') {
 *        return (
 *          <VideoPlayer 
 *            url={lesson.contentUrl}
 *            title={lesson.title}
 *            onDownload={() => window.open(lesson.contentUrl)}
 *          />
 *        );
 *      }
 *      // ... handle other types
 *    };
 */
