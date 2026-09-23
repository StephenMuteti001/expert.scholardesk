import type { ReactNode } from "react";
import { SupportChatContextProvider, useSupportChat } from "./support-chat-context";
import { SupportChatWidget } from "./SupportChatWidget";

export function SupportChatProvider({ children }: { children: ReactNode }) {
  return (
    <SupportChatContextProvider>
      {children}
      <SupportChatWidget />
    </SupportChatContextProvider>
  );
}

export { useSupportChat };
