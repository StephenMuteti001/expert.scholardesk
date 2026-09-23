import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationContextValue {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications", { params: { unread: true, limit: 1 } });
      setUnreadCount(data?.unread_count ?? data?.pagination?.total ?? 0);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void refreshUnreadCount();
    const timer = setInterval(() => void refreshUnreadCount(), 60_000);
    return () => clearInterval(timer);
  }, [user, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
