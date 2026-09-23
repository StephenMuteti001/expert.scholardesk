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
import SupportChatWidget from "@/components/support/SupportChatWidget";

interface SupportChatContextValue {
  isOpen: boolean;
  unreadCount: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  refreshUnread: () => Promise<void>;
}

const SupportChatContext = createContext<SupportChatContextValue | null>(null);

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/support-chat");
      const threads = (data?.data ?? []) as { unread?: number }[];
      setUnreadCount(
        threads.reduce((total, thread) => total + (thread.unread ?? 0), 0),
      );
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void refreshUnread();
    const timer = setInterval(() => void refreshUnread(), 60_000);
    return () => clearInterval(timer);
  }, [user, refreshUnread]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-support-chat", handler);
    return () => window.removeEventListener("open-support-chat", handler);
  }, []);

  return (
    <SupportChatContext.Provider
      value={{ isOpen, unreadCount, open, close, toggle, refreshUnread }}
    >
      {children}
      {user ? <SupportChatWidget /> : null}
    </SupportChatContext.Provider>
  );
}

export function useSupportChat() {
  const ctx = useContext(SupportChatContext);
  if (!ctx) throw new Error("useSupportChat must be used within SupportChatProvider");
  return ctx;
}

export function triggerSupportChat() {
  window.dispatchEvent(new Event("open-support-chat"));
}
