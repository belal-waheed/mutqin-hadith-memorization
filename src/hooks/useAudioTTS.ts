'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const activeStopCallbacks = new Set<() => void>();

export function useAudioTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback((text: string) => {
    // Stop any other active playback across the app
    activeStopCallbacks.forEach(cb => cb());
    activeStopCallbacks.clear();
    stop();

    activeStopCallbacks.add(stop);

    const encodedText = encodeURIComponent(text);
    const audio = new Audio(`/api/tts?text=${encodedText}`);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      activeStopCallbacks.delete(stop);
      audioRef.current = null;
    };
    audio.onerror = () => {
      console.error('TTS audio playback failed');
      setIsPlaying(false);
      activeStopCallbacks.delete(stop);
      audioRef.current = null;
    };

    setIsPlaying(true); // Optimistic — show loading state immediately
    audio.play().catch(() => {
      setIsPlaying(false);
      activeStopCallbacks.delete(stop);
    });
  }, [stop]);

  useEffect(() => {
    return () => {
      stop();
      activeStopCallbacks.delete(stop);
    };
  }, [stop]);

  return { play, stop, isPlaying, isSupported: true };
}
