export type NotificationCategory = 'Trial' | 'Payments' | 'Invoices' | 'System' | 'Account';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

type NotificationListener = () => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private storageKeyPrefix = 'bizpilotly_notifs_';

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  getNotifications(userId: string): AppNotification[] {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(`${this.storageKeyPrefix}${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse error
    }
    return [];
  }

  getUnreadCount(userId: string): number {
    const list = this.getNotifications(userId);
    return list.filter((n) => !n.read).length;
  }

  createNotification(
    userId: string,
    data: Omit<AppNotification, 'id' | 'userId' | 'createdAt' | 'read'>
  ): AppNotification {
    const list = this.getNotifications(userId);
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: data.title,
      message: data.message,
      category: data.category,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNotif, ...list].slice(0, 50); // Keep last 50
    this.save(userId, updated);
    this.notify();
    return newNotif;
  }

  markAsRead(userId: string, notificationId: string): void {
    const list = this.getNotifications(userId);
    const updated = list.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    this.save(userId, updated);
    this.notify();
  }

  markAllAsRead(userId: string): void {
    const list = this.getNotifications(userId);
    const updated = list.map((n) => ({ ...n, read: true }));
    this.save(userId, updated);
    this.notify();
  }

  deleteNotification(userId: string, notificationId: string): void {
    const list = this.getNotifications(userId);
    const updated = list.filter((n) => n.id !== notificationId);
    this.save(userId, updated);
    this.notify();
  }

  private save(userId: string, list: AppNotification[]): void {
    try {
      localStorage.setItem(`${this.storageKeyPrefix}${userId}`, JSON.stringify(list));
    } catch {
      // Ignore storage error
    }
  }
}

export const notificationService = new NotificationService();
