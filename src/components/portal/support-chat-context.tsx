import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SupportChatContextValue {
  isOpen: boolean;
  activeChatId: string | null;
  open: (chatId?: string) => void;
  close: () => void;
  setActiveChatId: (id: string | null) => void;
}

const SupportChatContext = createContext<SupportChatContextValue | null>(null);

export function SupportChatContextProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const open = useCallback((chatId?: string) => {
    setActiveChatId(chatId ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, activeChatId, open, close, setActiveChatId }),
    [isOpen, activeChatId, open, close],
  );

  return <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>;
}

export function useSupportChat() {
  const ctx = useContext(SupportChatContext);
  if (!ctx) throw new Error("useSupportChat must be used inside SupportChatProvider");
  return ctx;
}