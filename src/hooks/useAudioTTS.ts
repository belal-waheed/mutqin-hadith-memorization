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

    // Pick the best Arabic voice available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ar'));
    
    let bestVoice = null;
    
    // 1. Try to find Egyptian Arabic (ar-EG)
    bestVoice = arabicVoices.find(v => v.lang.includes('EG') || v.name.includes('Egypt') || v.name.includes('Salma') || v.name.includes('Shakir') || v.name.includes('Hoda'));
    
    // 2. Try to find Saudi Arabic (ar-SA) or Google/Microsoft premium
    if (!bestVoice) {
      bestVoice = arabicVoices.find(v => v.lang.includes('SA') || v.name.includes('Google') || v.name.includes('Microsoft'));
    }
    
    // 3. Fallback to any Arabic voice
    if (!bestVoice && arabicVoices.length > 0) {
      bestVoice = arabicVoices[0];
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = 'ar-EG'; // Force Egyptian locale request
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
