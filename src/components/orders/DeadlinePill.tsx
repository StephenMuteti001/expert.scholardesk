import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { deadlineInfo } from "@/lib/format";

const URGENCY_CLASS: Record<string, string> = {
  overdue: "text-destructive",
  critical: "text-destructive",
  soon: "text-warning",
  normal: "text-muted-foreground",
};

export default function DeadlinePill({
  deadline,
  className,
}: {
  deadline: string | null | undefined;
  className?: string;
}) {
  const info = deadlineInfo(deadline);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", URGENCY_CLASS[info.urgency], className)}>
      <Clock className="h-3.5 w-3.5" />
      {info.label}
    </span>
  );
}
