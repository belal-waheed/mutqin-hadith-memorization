'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Global listener set to ensure only one card plays audio at any time
const activeStopCallbacks = new Set<() => void>();

export function useAudioTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoicesLoaded(true);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback((text: string) => {
    if (!isSupported) return;

    // Stop any other active TTS playback instance across the app
    activeStopCallbacks.forEach(stopCallback => stopCallback());
    activeStopCallbacks.clear();
    
    // Safety stop
    window.speechSynthesis.cancel();

    const currentStop = () => stop();
    activeStopCallbacks.add(currentStop);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Try to find an Arabic voice, preferably Egyptian
    const voices = window.speechSynthesis.getVoices();
    const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
    const egVoice = arabicVoices.find(v => v.lang === 'ar-EG');
    
    if (egVoice) {
      utterance.voice = egVoice;
    } else if (arabicVoices.length > 0) {
      utterance.voice = arabicVoices[0];
    } else {
      utterance.lang = 'ar-EG';
    }

    // Settings for better Arabic reading
    utterance.rate = 0.85; 
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      activeStopCallbacks.delete(currentStop);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsPlaying(false);
      activeStopCallbacks.delete(currentStop);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, stop]);

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
