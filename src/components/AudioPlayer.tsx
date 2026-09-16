import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Download, Check, FastForward } from 'lucide-react';
import { downloadMediaFile } from '../services/mediaApi.ts';

interface AudioPlayerProps {
  src: string;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title = 'Áudio Gerado',
  subtitle = 'Fish Audio S2.1 Free',
  autoPlay = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1); // 1.0x
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    if (autoPlay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleCycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIdx);
    const nextSpeed = SPEED_OPTIONS[nextIdx];
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleDownload = async () => {
    await downloadMediaFile(src, 'audio');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3 sm:p-4 my-2 shadow-xs">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-main)] truncate max-w-[200px] sm:max-w-xs">
              {title}
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Playback speed toggle */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            className="px-2 py-1 rounded-md bg-[var(--surface-secondary)] hover:bg-[var(--bg-hover)] text-[10px] font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Alterar velocidade"
          >
            {SPEED_OPTIONS[speedIndex]}x
          </button>

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Baixar áudio"
          >
            {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="flex items-center space-x-2.5">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-all shadow-xs shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={handleStop}
          className="w-7 h-7 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] flex items-center justify-center transition-all shrink-0"
          title="Parar"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-[var(--accent)] h-1.5 bg-[var(--border-subtle)] rounded-lg cursor-pointer outline-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
