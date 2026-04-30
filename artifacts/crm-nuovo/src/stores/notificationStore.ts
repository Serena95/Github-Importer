import { create } from 'zustand';
import { CRMNotification } from '@/types/notifications';
import { notificationService } from '@/services/notificationService';

interface NotificationState {
  notifications: CRMNotification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  
  setNotifications: (notifications: CRMNotification[]) => void;
  setIsOpen: (isOpen: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  init: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: true,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount, isLoading: false });
  },

  setIsOpen: (isOpen) => set({ isOpen }),

  markAsRead: async (id) => {
    // Optimistic update
    const { notifications } = get();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    set({ 
      notifications: updated, 
      unreadCount: updated.filter(n => !n.read).length 
    });
    
    await notificationService.markAsRead(id);
  },

  markAllAsRead: async (userId) => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, read: true }));
    set({ notifications: updated, unreadCount: 0 });
    
    await notificationService.markAllAsRead(userId);
  },

  init: (userId) => {
    const unsubscribe = notificationService.subscribeToNotifications(userId, (notifications) => {
      get().setNotifications(notifications);
    });
    
    return unsubscribe;
  }
}));
