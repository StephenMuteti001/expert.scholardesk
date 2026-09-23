import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Paperclip, Upload, X } from "lucide-react";
import { toast } from "sonner";

import api, { apiErrorMessage } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/orders/$orderId/submit")({
  head: ({ params }) => ({
    meta: [
      { title: `Submit work — Assignment #${params.orderId}` },
      { name: "description", content: "Upload your completed files and notes for the customer." },
      { property: "og:title", content: `Submit work — Assignment #${params.orderId}` },
      {
        property: "og:description",
        content: "Upload your completed files and notes for the customer.",
      },
    ],
  }),
  component: SubmitWork,
});

function SubmitWork() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("note", note);
      files.forEach((file) => form.append("files[]", file));
      await api.post(`/orders/${orderId}/submissions`, form);
    },
    onSuccess: () => {
      toast.success("Work submitted for review");
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
      void navigate({ to: "/orders/$orderId", params: { orderId } });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not submit your work")),
  });

  return (
    <AppShell
      title="Submit work"
      description={`Assignment #${orderId}`}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/orders/$orderId" params={{ orderId }}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Link>
        </Button>
      }
    >
      <form
        className="surface-card mx-auto max-w-2xl space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (files.length === 0) {
            toast.error("Attach at least one file");
            return;
          }
          submit.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="files">Completed files</Label>
          <label
            htmlFor="files"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:border-primary"
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Click to attach files</span>
            <span className="text-xs text-muted-foreground">Documents, spreadsheets, slides or archives</span>
          </label>
          <input
            id="files"
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          {files.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note for the customer (optional)</Label>
          <Textarea
            id="note"
            rows={5}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Summarise what you delivered, sources used or anything the customer should know."
          />
        </div>

        <Button type="submit" className="w-full" disabled={submit.isPending}>
          {submit.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-4 w-4" />
          )}
          Submit work
        </Button>
      </form>
    </AppShell>
  );
}
