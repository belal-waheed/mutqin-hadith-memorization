'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import type { UserState } from '@/types';
import {
  getUserState,
  saveUserState,
  USER_STATE_CHANGE_EVENT,
} from '@/lib/user-storage';
import { ConflictResolutionModal } from './conflict-resolution-modal';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncContextValue {
  syncStatus: SyncStatus;
  isOnline: boolean;
  syncNow: () => Promise<void>;
  conflict: { localState: UserState; cloudState: UserState } | null;
  resolveConflict: (choice: 'keep-local' | 'download-cloud') => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSync() {
  return useContext(SyncContext);
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [conflict, setConflict] = useState<{
    localState: UserState;
    cloudState: UserState;
  } | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const hasSyncedUserIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (status === 'authenticated') {
        setSyncStatus('idle');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status]);

  // Push local state to cloud
  const pushState = useCallback(async (stateToPush?: UserState): Promise<boolean> => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return false;
    }

    try {
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      const state = stateToPush || getUserState();
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push', state }),
      });

      if (!res.ok) {
        throw new Error(`Sync push failed with status ${res.status}`);
      }

      setSyncStatus('synced');
      return true;
    } catch (err) {
      console.error('Push sync failed:', err);
      setSyncStatus('error');
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Pull cloud state
  const pullState = useCallback(async (): Promise<UserState | null> => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return null;
    }

    try {
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pull' }),
      });

      if (!res.ok) {
        throw new Error(`Sync pull failed with status ${res.status}`);
      }

      const data = await res.json();
      return (data.state as UserState) || null;
    } catch (err) {
      console.error('Pull sync failed:', err);
      setSyncStatus('error');
      return null;
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Initial Sync when user authenticates
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      if (hasSyncedUserIdRef.current === session.user.id) {
        return; // Already initialized sync for this active session
      }

      hasSyncedUserIdRef.current = session.user.id;

      const performInitialSync = async () => {
        const cloudState = await pullState();
        if (!cloudState) return;

        const localState = getUserState();

        const cloudCardsCount = Object.keys(cloudState.cards || {}).length;
        const localCardsCount = Object.keys(localState.cards || {}).length;

        const cloudHasData =
          cloudCardsCount > 0 ||
          (cloudState.currentStreak || 0) > 0 ||
          (cloudState.totalReviews || 0) > 0;

        const localHasData =
          localCardsCount > 0 ||
          (localState.currentStreak || 0) > 0 ||
          (localState.totalReviews || 0) > 0;

        if (cloudHasData && localHasData) {
          // Conflict condition: both cloud and local possess progress data
          setConflict({ localState, cloudState });
          setSyncStatus('idle');
        } else if (cloudHasData && !localHasData) {
          // Cloud has data, local is fresh -> download cloud state
          saveUserState(cloudState);
          setSyncStatus('synced');
        } else if (!cloudHasData && localHasData) {
          // Local has progress, cloud is brand new -> push local state
          await pushState(localState);
        } else {
          // Both are empty/fresh
          setSyncStatus('synced');
        }
      };

      performInitialSync();
    } else if (status === 'unauthenticated') {
      hasSyncedUserIdRef.current = null;
      setSyncStatus('idle');
      setConflict(null);
    }
  }, [status, session, pullState, pushState]);

  // Debounced push on userState change
  useEffect(() => {
    if (status !== 'authenticated') return;

    const handleStateChange = () => {
      // Do not push while resolving conflicts or offline
      if (conflict || !navigator.onLine) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        const currentState = getUserState();
        await pushState(currentState);
      }, 2000); // 2 seconds debounce
    };

    window.addEventListener(USER_STATE_CHANGE_EVENT, handleStateChange);

    return () => {
      window.removeEventListener(USER_STATE_CHANGE_EVENT, handleStateChange);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [status, conflict, pushState]);

  // Resolve conflict callback
  const resolveConflict = useCallback(
    async (choice: 'keep-local' | 'download-cloud') => {
      if (!conflict) return;

      setIsResolving(true);
      try {
        if (choice === 'keep-local') {
          const localState = getUserState();
          const success = await pushState(localState);
          if (success) {
            setConflict(null);
          }
        } else {
          saveUserState(conflict.cloudState);
          setConflict(null);
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Error resolving sync conflict:', err);
      } finally {
        setIsResolving(false);
      }
    },
    [conflict, pushState]
  );

  // Manual Trigger
  const syncNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const state = getUserState();
    await pushState(state);
  }, [pushState]);

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        isOnline,
        syncNow,
        conflict,
        resolveConflict,
      }}
    >
      {children}
      <ConflictResolutionModal
        isOpen={conflict !== null}
        localState={conflict?.localState ?? null}
        cloudState={conflict?.cloudState ?? null}
        onResolve={resolveConflict}
        isResolving={isResolving}
      />
    </SyncContext.Provider>
  );
}
