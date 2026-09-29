'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserState } from '@/lib/user-storage';

// Global listener set to ensure only one card plays audio at any time
const activeStopCallbacks = new Set<() => void>();

const MALE_VOICE_KEYWORDS = [
  'naayf', 'nayf', 'shakir', 'tarek', 'tarik', 'maged', 'majed',
  'hamed', 'mehdi', 'omar', 'zayd', 'male', 'man', 'ard'
];

const FEMALE_VOICE_KEYWORDS = [
  'hoda', 'salma', 'laila', 'layla', 'mariam', 'meryem', 'fatima',
  'zariyah', 'zeina', 'sana', 'amina', 'female', 'woman', 'arc'
];

export function useAudioTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          const arVoices = available.filter(v => v.lang.startsWith('ar'));
          setAvailableVoices(arVoices);
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

  const play = useCallback((text: string, genderOverride?: 'male' | 'female') => {
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

    const voices = window.speechSynthesis.getVoices();
    const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));

    // Determine target gender (from param or user preference, default male)
    const targetGender = genderOverride || getUserState().reciterGender || 'male';

    let chosenVoice: SpeechSynthesisVoice | null = null;
    let pitch = 0.9;

    if (targetGender === 'male') {
      // 1. Priority: Arabic voice with known male name (e.g. Naayf, Shakir, Tarek, Maged, etc.)
      chosenVoice = arabicVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return MALE_VOICE_KEYWORDS.some(k => nameLower.includes(k));
      }) || null;

      // 2. Priority: Any Arabic voice that is NOT known to be female
      if (!chosenVoice) {
        chosenVoice = arabicVoices.find(v => {
          const nameLower = v.name.toLowerCase();
          return !FEMALE_VOICE_KEYWORDS.some(k => nameLower.includes(k));
        }) || null;
      }

      // 3. Fallback: If only female voice exists on device (e.g. Windows with only Hoda)
      if (!chosenVoice && arabicVoices.length > 0) {
        chosenVoice = arabicVoices[0];
        pitch = 0.8; // Lower pitch to sound deeper/masculine
      } else {
        pitch = 0.88; // Calm, respectful recitation pitch
      }
    } else {
      // Female voice requested
      chosenVoice = arabicVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return FEMALE_VOICE_KEYWORDS.some(k => nameLower.includes(k));
      }) || arabicVoices[0] || null;

      pitch = 1.0;
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    } else {
      utterance.lang = 'ar-SA';
    }

    // Settings for dignified Arabic recitation
    utterance.rate = 0.82;
    utterance.pitch = pitch;

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
    availableVoices,
  };
}
