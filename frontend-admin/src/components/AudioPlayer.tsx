
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  title?: string;
  showTranscript?: boolean;
  transcript?: string;
  japaneseText?: string;
  onPlaybackComplete?: () => void;
  className?: string;
}

const AudioPlayer = ({ 
  src, 
  title, 
  showTranscript = false, 
  transcript = '', 
  japaneseText = '',
  onPlaybackComplete, 
  className 
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showJapaneseText, setShowJapaneseText] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Set up audio element and listeners
  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    
    const setAudioData = () => {
      setDuration(audio.duration);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onPlaybackComplete) {
        onPlaybackComplete();
      }
    };
    
    // Event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      // Remove event listeners on cleanup
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [src, onPlaybackComplete]);
  
  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '00:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = duration ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-100 p-4", className)}>
      {/* Title/Header */}
      {title && (
        <div className="mb-2 font-medium text-japan-navy">{title}</div>
      )}
      
      {/* Audio Controls */}
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-japan-indigo text-white hover:bg-japan-indigo/90 transition-colors"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 flex flex-col">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #293B97 ${progress}%, #e5e7eb ${progress}%)`
            }}
          />
          
          {/* Time Display */}
          <div className="flex justify-between text-xs text-japan-stone mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      
      {/* Transcript Toggle (if applicable) */}
      {showTranscript && transcript && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-japan-navy">
              {showJapaneseText ? '日本語 (Japanese)' : 'English'}
            </span>
            <button 
              onClick={() => setShowJapaneseText(!showJapaneseText)}
              className="text-xs text-japan-indigo hover:underline"
            >
              {showJapaneseText ? 'Show English' : 'Show Japanese'}
            </button>
          </div>
          <div className="p-2 bg-gray-50 rounded-md text-sm">
            {showJapaneseText ? (
              <p className="japanese-text tracking-wide">{japaneseText}</p>
            ) : (
              <p>{transcript}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
