export function formatCurrency(amount?: number | string | null, currency = "USD") {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  if (Number.isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export type DeadlineInfo = {
  label: string;
  overdue: boolean;
  urgency: "overdue" | "critical" | "soon" | "normal";
};

export function deadlineInfo(iso?: string | null): DeadlineInfo {
  if (!iso) return { label: "No deadline", overdue: false, urgency: "normal" };
  const deadline = new Date(iso).getTime();
  if (Number.isNaN(deadline)) return { label: "No deadline", overdue: false, urgency: "normal" };

  let diff = deadline - Date.now();
  const overdue = diff < 0;
  diff = Math.abs(diff);

  const totalHours = Math.floor(diff / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  const parts =
    days > 0
      ? `${days}d ${hours}h`
      : totalHours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m`;

  const hoursLeft = (deadline - Date.now()) / 3_600_000;
  const urgency: DeadlineInfo["urgency"] = overdue
    ? "overdue"
    : hoursLeft <= 6
      ? "critical"
      : hoursLeft <= 24
        ? "soon"
        : "normal";

  return { label: overdue ? `Overdue by ${parts}` : `${parts} left`, overdue, urgency };
}

export function initials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
