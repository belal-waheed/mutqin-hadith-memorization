'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Global listener set to ensure only one card plays audio at any time
const activeStopCallbacks = new Set<() => void>();

export function useAudioTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true); // Always true since we use custom backend
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback((text: string) => {
    // Stop any other active TTS playback instance across the app
    activeStopCallbacks.forEach(stopCallback => stopCallback());
    activeStopCallbacks.clear();

    const currentStop = () => {
      stop();
    };
    activeStopCallbacks.add(currentStop);

    // Use our custom Edge TTS API backend
    const url = `/api/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlaying(true);
    };

    audio.onended = () => {
      setIsPlaying(false);
      activeStopCallbacks.delete(currentStop);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlaying(false);
      activeStopCallbacks.delete(currentStop);
      audioRef.current = null;
      console.error('Audio playback failed');
    };

    audio.play().catch(e => {
      console.error('Failed to play audio:', e);
      setIsPlaying(false);
    });
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      activeStopCallbacks.delete(stop);
    };
  }, [stop]);

  return {
    play,
    stop,
    isPlaying,
    isSupported,
  };
}
