import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export type WorkdayStatus = 'idle' | 'working' | 'paused';

export interface WorkdayEntry {
  status: WorkdayStatus;
  startedAt: Timestamp | null;
  pausedAt: Timestamp | null;
  totalPausedMs: number;
  endedAt: Timestamp | null;
  totalWorkedMs: number;
}

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

function docRef(tenantId: string, uid: string) {
  return doc(db, 'tenants', tenantId, 'workday', `${uid}_${todayKey()}`);
}

export function useWorkday() {
  const { user, profile } = useAuth();
  const [entry, setEntry] = useState<WorkdayEntry | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.uid || !profile?.tenantId) return;
    try {
      const snap = await getDoc(docRef(profile.tenantId, user.uid));
      if (snap.exists()) {
        setEntry(snap.data() as WorkdayEntry);
      } else {
        setEntry(null);
      }
    } catch {}
    setLoading(false);
  }, [user?.uid, profile?.tenantId]);

  useEffect(() => { load(); }, [load]);

  // Live elapsed timer
  useEffect(() => {
    if (!entry || entry.status !== 'working') return;
    const tick = () => {
      const now = Date.now();
      const startMs = entry.startedAt ? entry.startedAt.toMillis() : now;
      const pausedMs = entry.totalPausedMs || 0;
      setElapsed(now - startMs - pausedMs);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [entry]);

  const save = useCallback(async (data: Partial<WorkdayEntry>) => {
    if (!user?.uid || !profile?.tenantId) return;
    await setDoc(docRef(profile.tenantId, user.uid), data, { merge: true });
    setEntry((prev) => ({ ...(prev ?? defaultEntry()), ...data }));
  }, [user?.uid, profile?.tenantId]);

  const startDay = useCallback(async () => {
    const data: WorkdayEntry = {
      status: 'working',
      startedAt: Timestamp.now(),
      pausedAt: null,
      totalPausedMs: 0,
      endedAt: null,
      totalWorkedMs: 0,
    };
    await save(data);
  }, [save]);

  const pauseDay = useCallback(async () => {
    await save({ status: 'paused', pausedAt: Timestamp.now() });
  }, [save]);

  const resumeDay = useCallback(async () => {
    if (!entry?.pausedAt) return;
    const extraPause = Date.now() - entry.pausedAt.toMillis();
    await save({
      status: 'working',
      pausedAt: null,
      totalPausedMs: (entry.totalPausedMs || 0) + extraPause,
    });
  }, [entry, save]);

  const endDay = useCallback(async () => {
    await save({
      status: 'idle',
      endedAt: Timestamp.now(),
      totalWorkedMs: elapsed,
    });
    setElapsed(0);
  }, [save, elapsed]);

  return { entry, elapsed, loading, startDay, pauseDay, resumeDay, endDay };
}

function defaultEntry(): WorkdayEntry {
  return {
    status: 'idle',
    startedAt: null,
    pausedAt: null,
    totalPausedMs: 0,
    endedAt: null,
    totalWorkedMs: 0,
  };
}

export function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
