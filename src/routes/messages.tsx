import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessagesSquare, Plus, Send } from "lucide-react";
import { toast } from "sonner";

import api, { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { initials, timeAgo } from "@/lib/format";
import type { ChatMessage, ChatSummary } from "@/types/portal";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/messages")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search['orderId'] === "string" ? (search['orderId'] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Messages — ScholarDesk Expert Portal" },
      { name: "description", content: "Chat with the ScholarDesk support team about your assigned orders." },
      { property: "og:title", content: "Messages — ScholarDesk Expert Portal" },
      {
        property: "og:description",
        content: "Chat with the ScholarDesk support team about your assigned orders.",
      },
    ],
  }),
  component: MessagesPage,
});

// Experts never message a customer directly - every conversation here
// is expert <-> ScholarDesk support (same backend endpoint the
// customer portal uses; each user only ever sees their own threads).
function MessagesPage() {
  const { orderId } = Route.useSearch();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const threads = useQuery({
    queryKey: ["support-threads"],
    queryFn: async (): Promise<ChatSummary[]> => {
      const { data } = await api.get("/support-chat");
      return data?.data ?? [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (activeId || !threads.data?.length) return;
    const match = orderId
      ? threads.data.find((t) => t.orderReference === orderId)
      : undefined;
    setActiveId(match?.id ?? threads.data[0]?.id ?? "");
  }, [threads.data, orderId, activeId]);

  const messages = useQuery({
    queryKey: ["support-messages", activeId],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data } = await api.get(`/support-chat/${activeId}/messages`);
      return data?.data ?? [];
    },
    enabled: Boolean(activeId),
    refetchInterval: 15000,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data]);

  const send = useMutation({
    mutationFn: async (body: string) => {
      await api.post(`/support-chat/${activeId}/messages`, { body });
    },
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["support-messages", activeId] });
      void queryClient.invalidateQueries({ queryKey: ["support-threads"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Message not sent")),
  });

  const startThread = useMutation({
    mutationFn: async (subject: string) => {
      const { data } = await api.post("/support-chat", {
        subject,
        orderReference: orderId || undefined,
      });
      return data?.data as ChatSummary;
    },
    onSuccess: (thread) => {
      setNewSubject("");
      setShowNewThread(false);
      void queryClient.invalidateQueries({ queryKey: ["support-threads"] });
      setActiveId(thread.id);
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Unable to start conversation")),
  });

  const activeThread = threads.data?.find((t) => t.id === activeId);

  return (
    <AppShell title="Messages" description="Talk to ScholarDesk support about your assigned orders.">
      {threads.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (threads.data?.length ?? 0) === 0 && !showNewThread ? (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          description="Reach out to support any time you have a question about an order."
          action={
            <Button onClick={() => setShowNewThread(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Message support
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface-card scrollbar-slim max-h-[70vh] overflow-y-auto p-2">
            <div className="p-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowNewThread(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                New conversation
              </Button>
            </div>

            {threads.data!.map((thread) => (
              <button
                key={thread.id}
                onClick={() => { setActiveId(thread.id); setShowNewThread(false); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  thread.id === activeId && !showNewThread ? "bg-primary-soft" : "hover:bg-muted",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials(thread.agentName || "Support")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{thread.subject}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {thread.lastMessage || "No messages yet"}
                  </span>
                </span>
                {thread.unread > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {thread.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </aside>

          <section className="surface-card flex max-h-[70vh] flex-col">
            {showNewThread ? (
              <form
                className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!newSubject.trim()) return;
                  startThread.mutate(newSubject.trim());
                }}
              >
                <MessagesSquare className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Start a new conversation with support</p>
                <Input
                  autoFocus
                  value={newSubject}
                  onChange={(event) => setNewSubject(event.target.value)}
                  placeholder="What's this about?"
                  className="max-w-sm"
                />
                <div className="flex gap-2">
                  {threads.data && threads.data.length > 0 && (
                    <Button type="button" variant="ghost" onClick={() => setShowNewThread(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={startThread.isPending || !newSubject.trim()}>
                    {startThread.isPending ? "Starting…" : "Start conversation"}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <header className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold">{activeThread?.subject || "Conversation"}</p>
                  {activeThread?.orderReference && (
                    <p className="text-xs text-muted-foreground">Order {activeThread.orderReference}</p>
                  )}
                </header>

                <div className="scrollbar-slim flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {messages.isLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    messages.data?.map((message) => {
                      const mine = message.author === "expert";
                      return (
                        <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                              mine
                                ? "rounded-br-sm bg-primary text-primary-foreground"
                                : "rounded-bl-sm bg-muted text-foreground",
                            )}
                          >
                            <p className="whitespace-pre-wrap">{message.body}</p>
                            <p
                              className={cn(
                                "mt-1 text-[11px]",
                                mine ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              {mine ? "You" : message.authorName} · {timeAgo(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={endRef} />
                </div>

                <form
                  className="flex items-center gap-2 border-t border-border px-3 py-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!draft.trim()) return;
                    send.mutate(draft.trim());
                  }}
                >
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message…"
                  />
                  <Button type="submit" size="icon" disabled={send.isPending || !draft.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
