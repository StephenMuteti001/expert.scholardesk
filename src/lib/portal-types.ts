export type OrderStage =
  | "quote_requested"
  | "quote_sent"
  | "awaiting_payment"
  | "matching_writer"
  | "in_progress"
  | "quality_review"
  | "delivered"
  | "revision_in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "refund_requested" | "refunded";

export type ChatStatus = "open" | "pending" | "resolved" | "archived";

export interface OrderFile {
  id: string;
  name: string;
  size: number;
  url?: string | undefined;
}

export interface Quote {
  amount: number;
  currency: string;
  issuedAt: string;
  expiresAt?: string | undefined;
  deliverySchedule: string;
  notes?: string | undefined;
  acceptedAt?: string | undefined;
  rejectedAt?: string | undefined;
  issuedByRole?: "admin" | "customer" | undefined;
}

export interface Submission {
  id: string;
  version: number;
  title: string;
  submittedAt: string;
  summary: string;
  files: OrderFile[];
  aiScore: number;
  plagiarismScore: number;
  status: "delivered" | "revision_requested" | "approved" | "rejected";
  revisionNote?: string | undefined;
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: "customer" | "support" | "expert" | "system";
  title: string;
  detail?: string | undefined;
}

export interface Order {
  id: string;
  reference: string;
  title: string;
  subject: string;
  assignmentType: string;
  wordCount: number;
  pages: number;
  citationStyle: string;
  deadline: string;
  createdAt: string;
  instructions: string;
  files: OrderFile[];
  stage: OrderStage;
  paymentStatus: PaymentStatus;
  quote?: Quote | undefined;
  submissions: Submission[];
  activity: ActivityEvent[];
  chatId?: string | undefined;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  author: "customer" | "support";
  authorName: string;
  body: string;
  sentAt: string;
}

export interface ChatThread {
  id: string;
  subject: string;
  orderReference?: string | undefined;
  status: ChatStatus;
  agentName: string;
  unread: number;
  updatedAt: string;
  lastMessage: string;
}

export const OPEN_STAGES: OrderStage[] = ["quote_requested", "quote_sent", "awaiting_payment"];

export const STAGE_LABELS: Record<OrderStage, string> = {
  quote_requested: "Quote requested",
  quote_sent: "Quote received",
  awaiting_payment: "Awaiting payment",
  matching_writer: "Matching specialist",
  in_progress: "Specialist working",
  quality_review: "Quality & integrity review",
  delivered: "Delivered to you",
  revision_in_progress: "Rework in progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Not paid",
  partially_paid: "Part paid",
  paid: "Paid",
  refund_requested: "Refund requested",
  refunded: "Refunded",
};

export const WORKFLOW_STEPS: { stage: OrderStage; title: string; description: string }[] = [
  {
    stage: "quote_requested",
    title: "You submit the brief",
    description: "Send the task, rubric and deadline. Nothing is charged at this point.",
  },
  {
    stage: "quote_sent",
    title: "ScholarDesk quotes you",
    description:
      "A support specialist reviews the brief and sends a price and delivery schedule, usually within 30 minutes.",
  },
  {
    stage: "awaiting_payment",
    title: "You approve and pay",
    description:
      "Agree the budget by chat or email, then pay to convert the request into an active order.",
  },
  {
    stage: "matching_writer",
    title: "We match a specialist",
    description: "Our team assigns a vetted expert with a track record in your subject.",
  },
  {
    stage: "in_progress",
    title: "The specialist writes",
    description: "You never deal with the expert directly. All communication runs through our team.",
  },
  {
    stage: "quality_review",
    title: "Integrity review",
    description:
      "Every submission is screened for AI-generated content and plagiarism. Failing work goes straight back to the expert.",
  },
  {
    stage: "delivered",
    title: "We deliver to you",
    description: "You review the work and can request a rework, which we escalate to the expert.",
  },
  {
    stage: "completed",
    title: "Approved and closed",
    description: "You approve the final submission, or request a refund if we fell short.",
  },
];

/* ---------------- Exam materials ---------------- */

export type MaterialFormat = "PDF" | "DOCX" | "PPTX" | "ZIP";

export interface ExamMaterial {
  id: string;
  title: string;
  summary: string;
  subject: string;
  level: "Undergraduate" | "Postgraduate" | "Professional";
  category: "Past papers" | "Revision notes" | "Question banks" | "Study guides" | "Model answers";
  institution?: string | undefined;
  year: number;
  pages: number;
  format: MaterialFormat;
  price: number;
  currency: string;
  rating: number;
  downloads: number;
  owned: boolean;
}

/* ---------------- Integrity checks ---------------- */

export type IntegrityStatus = "queued" | "processing" | "ready" | "failed";

export interface IntegrityReport {
  id: string;
  fileName: string;
  wordCount: number;
  submittedAt: string;
  status: IntegrityStatus;
  checks: { ai: boolean; plagiarism: boolean };
  aiScore?: number | undefined;
  plagiarismScore?: number | undefined;
  topMatches?: { source: string; overlap: number }[] | undefined;
  reportUrl?: string | undefined;
}

export const MATERIAL_CATEGORIES: ExamMaterial["category"][] = [
  "Past papers",
  "Revision notes",
  "Question banks",
  "Study guides",
  "Model answers",
];

export const MATERIAL_LEVELS: ExamMaterial["level"][] = [
  "Undergraduate",
  "Postgraduate",
  "Professional",
];
