'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Global listener set to ensure only one card plays audio at any time
const activeStopCallbacks = new Set<() => void>();

export function useAudioTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
  }, []);

  const play = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Stop any other active TTS playback instance across the app
    activeStopCallbacks.forEach(stopCallback => stopCallback());
    activeStopCallbacks.clear();

    window.speechSynthesis.cancel();

    // Register this instance's stop callback
    const currentStop = () => {
      setIsPlaying(false);
    };
    activeStopCallbacks.add(currentStop);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Pick an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'));

    if (arabicVoice) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang;
    } else {
      utterance.lang = 'ar-SA';
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      activeStopCallbacks.delete(currentStop);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      activeStopCallbacks.delete(currentStop);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    play,
    stop,
    isPlaying,
    isSupported,
  };
}
