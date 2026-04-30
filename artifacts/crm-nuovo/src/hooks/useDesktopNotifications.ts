import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import type { CRMNotification } from '@/types/notifications';

const STORAGE_KEY = 'nexus:lastNotifSeen';

function getLastSeen(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? parseInt(v, 10) : Date.now();
  } catch {
    return Date.now();
  }
}

function setLastSeen(ts: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ts));
  } catch {}
}

function getNotificationTimestamp(n: CRMNotification): number {
  const c: any = (n as any).createdAt;
  if (!c) return 0;
  if (typeof c === 'number') return c;
  if (typeof c.toMillis === 'function') return c.toMillis();
  if (c.seconds) return c.seconds * 1000;
  return new Date(c).getTime() || 0;
}

export function useDesktopNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const lastSeenRef = useRef<number>(getLastSeen());
  const permissionRequestedRef = useRef(false);

  // Ask for permission once, after a small delay (better UX than immediately)
  useEffect(() => {
    if (permissionRequestedRef.current) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'default') return;

    const t = setTimeout(() => {
      Notification.requestPermission().catch(() => {});
      permissionRequestedRef.current = true;
    }, 5000);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') {
      // Update last seen so we don't spam when tab is focused
      const newest = notifications.reduce((max, n) => {
        const ts = getNotificationTimestamp(n);
        return ts > max ? ts : max;
      }, lastSeenRef.current);
      if (newest > lastSeenRef.current) {
        lastSeenRef.current = newest;
        setLastSeen(newest);
      }
      return;
    }

    const fresh = notifications.filter((n) => {
      const ts = getNotificationTimestamp(n);
      return ts > lastSeenRef.current && !n.read;
    });

    if (!fresh.length) return;

    let newestTs = lastSeenRef.current;
    fresh.slice(0, 3).forEach((n) => {
      const ts = getNotificationTimestamp(n);
      if (ts > newestTs) newestTs = ts;
      try {
        const notif = new Notification('Nexus CRM', {
          body: (n as any).title || (n as any).message || 'Hai una nuova notifica',
          icon: '/favicon.ico',
          tag: n.id,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch {}
    });

    lastSeenRef.current = newestTs;
    setLastSeen(newestTs);
  }, [notifications]);
}
