/** Live API data layer for the customer portal. No mock or in-memory fallback is used. */
import api from "./api";
import type { ChatMessage, ChatThread, ExamMaterial, IntegrityReport, Order } from "./portal-types";

type Envelope<T> = T | { data: T } | { data: { data: T } };

function unwrap<T>(payload: Envelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const first = (payload as { data: T | { data: T } }).data;
    if (first && typeof first === "object" && "data" in first) return (first as { data: T }).data;
    return first as T;
  }
  return payload as T;
}

const get = async <T>(path: string) => unwrap<T>(await api.get<Envelope<T>>(path));
const post = async <T>(path: string, body?: unknown) => unwrap<T>(await api.post<Envelope<T>>(path, body));
const patch = async <T>(path: string, body?: unknown) => unwrap<T>(await api.patch<Envelope<T>>(path, body));

export async function fetchOrders(): Promise<Order[]> { return get<Order[]>("/orders"); }
export async function fetchOrder(orderId: string): Promise<Order> { return get<Order>(`/orders/${orderId}`); }

export type OrderListStatus = "active" | "delivered" | "completed" | "cancelled";
export interface FilteredOrders {
  orders: Order[];
  counts?: Partial<Record<OrderListStatus, number>>;
}

export async function fetchOrdersByStatus(status: OrderListStatus): Promise<FilteredOrders> {
  const payload = await api.get<Order[] | { data: Order[] | { data: Order[] }; meta?: { counts?: FilteredOrders["counts"] } }>(
    `/orders?status=${encodeURIComponent(status)}`,
  );
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = payload.data;
    if (Array.isArray(data)) {
      const counts = payload.meta?.counts;
      return { orders: data, ...(counts === undefined ? {} : { counts }) };
    }
    if (data && typeof data === "object" && "data" in data) return { orders: data.data };
  }
  return { orders: Array.isArray(payload) ? payload : [] };
}

export interface QuoteRequestInput {
  fullName: string;
  email: string;
  title: string;
  subject: string;
  assignmentType: string;
  wordCount: number;
  citationStyle: string;
  deadline: string;
  instructions: string;
  fileNames: string[];
}

export async function createQuoteRequest(input: QuoteRequestInput): Promise<Order> {
  return post<Order>("/orders/quote-requests", input);
}
export async function acceptQuote(orderId: string): Promise<Order> {
  return post<Order>(`/orders/${orderId}/quote/accept`);
}
export async function payOrder(orderId: string): Promise<Order> {
  return post<Order>(`/orders/${orderId}/payments`);
}
export async function cancelOrder(orderId: string, reason: string): Promise<Order> {
  return post<Order>(`/orders/${orderId}/cancel`, { reason });
}
export async function updateOrder(orderId: string, changes: Partial<Order>): Promise<Order> {
  return patch<Order>(`/orders/${orderId}`, changes);
}
export async function requestRevision(orderId: string, submissionId: string, note: string): Promise<Order> {
  return post<Order>(`/orders/${orderId}/submissions/${submissionId}/revision-requests`, { note });
}
export async function approveSubmission(orderId: string, submissionId: string): Promise<Order> {
  return post<Order>(`/orders/${orderId}/submissions/${submissionId}/approve`);
}
export async function requestRefund(orderId: string, reason: string): Promise<Order> {
  return post<Order>(`/orders/${orderId}/refund-requests`, { reason });
}

export async function fetchThreads(): Promise<ChatThread[]> { return get<ChatThread[]>("/support-chat"); }
export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  return get<ChatMessage[]>(`/support-chat/${chatId}/messages`);
}
export async function sendMessage(chatId: string, body: string): Promise<ChatMessage> {
  return post<ChatMessage>(`/support-chat/${chatId}/messages`, { body });
}
export async function startThread(subject: string, orderReference?: string): Promise<ChatThread> {
  return post<ChatThread>("/support-chat", { subject, ...(orderReference ? { orderReference } : {}) });
}

export interface MaterialFilters {
  q?: string;
  subject?: string;
  level?: string;
  category?: string;
  sort?: "popular" | "newest" | "price_low" | "rating";
  page?: number;
  perPage?: number;
}

export interface MaterialPage {
  materials: ExamMaterial[];
  page: number;
  hasMore: boolean;
  total?: number;
  facets?: { subjects?: string[] };
}

export async function fetchMaterials(filters: MaterialFilters = {}): Promise<MaterialPage> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.level) params.set("level", filters.level);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(filters.page ?? 1));
  params.set("per_page", String(filters.perPage ?? 12));

  const payload = await api.get<ExamMaterial[] | {
    data: ExamMaterial[] | { data: ExamMaterial[] };
    meta?: { current_page?: number; last_page?: number; total?: number; has_more?: boolean; facets?: { subjects?: string[] } };
  }>(`/exam-materials?${params.toString()}`);
  if (Array.isArray(payload)) return { materials: payload, page: 1, hasMore: false, total: payload.length };
  const first = payload.data;
  if (Array.isArray(first)) {
    const page = payload.meta?.current_page ?? filters.page ?? 1;
    return {
      materials: first,
      page,
      hasMore: payload.meta?.has_more ?? (payload.meta?.last_page ? page < payload.meta.last_page : false),
      ...(payload.meta?.total === undefined ? {} : { total: payload.meta.total }),
      ...(payload.meta?.facets === undefined ? {} : { facets: payload.meta.facets }),
    };
  }
  return { materials: first.data, page: filters.page ?? 1, hasMore: false };
}
export async function purchaseMaterial(materialId: string): Promise<ExamMaterial> {
  return post<ExamMaterial>(`/exam-materials/${materialId}/purchase`);
}

export async function fetchIntegrityReports(): Promise<IntegrityReport[]> {
  return get<IntegrityReport[]>("/integrity-reports");
}

export interface IntegrityQuoteInput {
  fileName: string;
  wordCount: number;
  checks: { ai: boolean; plagiarism: boolean };
}

/** Integrity checks are support-managed work and therefore begin as a quote request. */
export async function requestIntegrityQuote(input: IntegrityQuoteInput): Promise<Order> {
  const requestedChecks = [input.checks.ai ? "AI-content report" : "", input.checks.plagiarism ? "plagiarism similarity report" : ""]
    .filter(Boolean)
    .join(" and ");
  return createQuoteRequest({
    fullName: "Customer",
    email: "",
    title: `Integrity review: ${input.fileName}`,
    subject: "Academic integrity",
    assignmentType: "AI & plagiarism review",
    wordCount: input.wordCount,
    citationStyle: "Not required",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    instructions: `Please quote for a support-managed ${requestedChecks}. The document supplied is ${input.fileName}.`,
    fileNames: [input.fileName],
  });
}
