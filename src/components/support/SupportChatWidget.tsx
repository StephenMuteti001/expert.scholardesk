import { useNavigate } from "@tanstack/react-router";
import { Headphones } from "lucide-react";

import { useSupportChat } from "@/contexts/SupportChatContext";
import { cn } from "@/lib/utils";

/**
 * A lightweight floating shortcut to the full Messages page
 * (/messages), rather than a second, parallel chat implementation -
 * see messages.tsx for the actual expert <-> support conversation UI
 * and the real /support-chat contract it uses.
 */
export default function SupportChatWidget() {
  const navigate = useNavigate();
  const { unreadCount } = useSupportChat();

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/messages", search: { orderId: "" } })}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105",
      )}
      aria-label="Open messages"
    >
      <Headphones className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-destructive-foreground">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
