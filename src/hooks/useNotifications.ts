'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mutqin_daily_reminder_enabled';

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      const stored = localStorage.getItem(STORAGE_KEY);
      // Only keep enabled if permission is granted
      if (stored === 'true' && Notification.permission === 'granted') {
        setIsEnabled(true);
      } else if (Notification.permission !== 'granted') {
        setIsEnabled(false);
        localStorage.setItem(STORAGE_KEY, 'false');
      }
    }

    setIsLoaded(true);
  }, []);

  const sendTestNotification = useCallback((): boolean => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    try {
      new Notification('مُتقِن', {
        body: 'حان وقت وِردك اليومي من الأحاديث النبوية!',
        icon: '/icon.svg',
      });
      return true;
    } catch (err) {
      console.error('Failed to trigger notification:', err);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  }, []);

  const toggleReminder = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (isEnabled) {
      setIsEnabled(false);
      localStorage.setItem(STORAGE_KEY, 'false');
      return false;
    }

    // Attempting to turn ON
    let currentPerm = Notification.permission;
    if (currentPerm === 'default') {
      currentPerm = await requestPermission();
    }

    if (currentPerm === 'granted') {
      setIsEnabled(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      sendTestNotification();
      return true;
    }

    // Denied or closed prompt
    setIsEnabled(false);
    localStorage.setItem(STORAGE_KEY, 'false');
    return false;
  }, [isEnabled, requestPermission, sendTestNotification]);

  return {
    isSupported,
    permission,
    isEnabled,
    isLoaded,
    requestPermission,
    toggleReminder,
    sendTestNotification,
  };
}
