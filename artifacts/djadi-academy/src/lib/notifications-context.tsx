import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  icon: "info" | "warning" | "success" | "lesson" | "exam";
  read: boolean;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
});

const STORAGE_KEY = "djadi_notifications";

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "درس جديد متاح",
    description: "تمت إضافة درس جديد في مادة الرياضيات: التكاملات",
    date: "2026-07-29",
    time: "09:00",
    icon: "lesson",
    read: false,
  },
  {
    id: "2",
    title: "اختبار قادم",
    description: "تذكير: اختبار الفيزياء والكيمياء يوم الخميس القادم",
    date: "2026-07-28",
    time: "14:30",
    icon: "exam",
    read: false,
  },
  {
    id: "3",
    title: "مرحباً بك في منصة جعدي",
    description: "تم تفعيل حسابك بنجاح. ابدأ رحلتك التعليمية الآن!",
    date: "2026-07-27",
    time: "10:00",
    icon: "success",
    read: true,
  },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Notification[];
    } catch {}
    return DEMO_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
