import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Headset, MessageSquare, Plus, Send, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatStatusBadge } from "./StatusBadge";
import { useSupportChat } from "./support-chat-context";
import { fetchMessages, fetchThreads, sendMessage, startThread } from "@/lib/portal-data";
import type { ChatStatus } from "@/lib/portal-types";

const FILTERS: { key: "active" | ChatStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "resolved", label: "Resolved" },
  { key: "archived", label: "Archived" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function SupportChatWidget() {
  const { isOpen, open, close, activeChatId, setActiveChatId } = useSupportChat();
  const [filter, setFilter] = useState<"active" | ChatStatus>("active");
  const queryClient = useQueryClient();

  const threadsQuery = useQuery({
    queryKey: ["support-threads"],
    queryFn: fetchThreads,
    enabled: isOpen,
  });

  const unread = useMemo(
    () => (threadsQuery.data ?? []).reduce((sum, t) => sum + t.unread, 0),
    [threadsQuery.data],
  );

  const threads = useMemo(() => {
    const all = threadsQuery.data ?? [];
    if (filter === "active") return all.filter((t) => t.status === "open" || t.status === "pending");
    return all.filter((t) => t.status === filter);
  }, [threadsQuery.data, filter]);

  const activeThread = (threadsQuery.data ?? []).find((t) => t.id === activeChatId) ?? null;

  const newThread = useMutation({
    mutationFn: () => startThread("New conversation with support"),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ["support-threads"] });
      setActiveChatId(thread.id);
    },
  });

  return (
    <>
      <button
        type="button"
        onClick={() => (isOpen ? close() : open())}
        aria-label="ScholarDesk support chat"
        className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-panel transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      >
        {isOpen ? <X className="size-6" /> : <Headset className="size-6" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          aria-label="Support conversations"
          className="fixed inset-x-3 bottom-24 z-50 flex h-[min(38rem,calc(100vh-8rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-panel sm:inset-x-auto sm:right-5 sm:w-[24.5rem]"
        >
          <header className="bg-primary px-4 py-4 text-primary-foreground">
            <div className="flex items-start gap-3">
              {activeThread && (
                <button
                  type="button"
                  onClick={() => setActiveChatId(null)}
                  className="mt-0.5 rounded-md p-1 text-white/80 hover:bg-white/15 hover:text-white"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold">
                  {activeThread ? activeThread.subject : "ScholarDesk Support"}
                </p>
                <p className="truncate text-xs text-white/75">
                  {activeThread
                    ? activeThread.agentName
                    : "Real people from our ScholarDesk support team, never experts"}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close support chat"
                className="rounded-md p-1 text-white/80 hover:bg-white/15 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          {activeThread ? (
            <Conversation chatId={activeThread.id} agentName={activeThread.agentName} />
          ) : (
            <>
              <div className="flex items-center gap-1 border-b border-border px-3 py-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                      filter === f.key
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => newThread.mutate()}
                  disabled={newThread.isPending}
                  className="ml-auto inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <Plus className="size-3.5" /> New
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {threadsQuery.isLoading ? (
                  <div className="space-y-2 p-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-xl border border-border p-3">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="mt-2 h-3 w-full" />
                        <Skeleton className="mt-2 h-3 w-20" />
                      </div>
                    ))}
                  </div>
                ) : threads.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                    <MessageSquare className="size-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold">No {filter} conversations</p>
                    <p className="text-xs text-muted-foreground">
                      Start a conversation and a support agent will pick it up.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {threads.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setActiveChatId(t.id)}
                          className="w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
                        >
                          <div className="flex items-start gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{t.subject}</p>
                            <ChatStatusBadge status={t.status} />
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{t.lastMessage}</p>
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>{t.agentName}</span>
                            <span aria-hidden>·</span>
                            <span>{timeAgo(t.updatedAt)}</span>
                            {t.unread > 0 && (
                              <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                                {t.unread} new
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="flex items-center gap-2 border-t border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 shrink-0" />
                Conversations close or archive only once your issue is resolved.
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}

function Conversation({ chatId, agentName }: { chatId: string; agentName: string }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useQuery({
    queryKey: ["support-messages", chatId],
    queryFn: () => fetchMessages(chatId),
  });

  const send = useMutation({
    mutationFn: (body: string) => sendMessage(chatId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["support-threads"] });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messagesQuery.data]);

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto bg-surface/60 p-3">
        {messagesQuery.isLoading ? (
          <>
            <Skeleton className="h-14 w-3/4 rounded-xl" />
            <Skeleton className="ml-auto h-10 w-2/3 rounded-xl" />
            <Skeleton className="h-16 w-4/5 rounded-xl" />
          </>
        ) : (
          (messagesQuery.data ?? []).map((m) => (
            <div key={m.id} className={cn("flex", m.author === "customer" && "justify-end")}>
              <div className="max-w-[85%]">
                <p
                  className={cn(
                    "mb-1 text-[11px] font-medium text-muted-foreground",
                    m.author === "customer" && "text-right",
                  )}
                >
                  {m.author === "customer" ? "You" : m.authorName}
                </p>
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm leading-relaxed",
                    m.author === "customer"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-card-foreground",
                  )}
                >
                  {m.body}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form
        className="border-t border-border p-2"
        onSubmit={(e) => {
          e.preventDefault();
          const body = draft.trim();
          if (!body) return;
          send.mutate(body);
          setDraft("");
        }}
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder={`Message ${agentName.split(",")[0]}…`}
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={send.isPending || !draft.trim()}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </>
  );
}
