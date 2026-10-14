import { API_BASE_URL } from "./api";

export class ExpertAuthRequiredError extends Error {}

function csrfToken() {
  if (typeof document === "undefined") return null;
  const value = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]+)/)?.[1];
  return value ? decodeURIComponent(value) : null;
}

export async function expertRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const form = typeof FormData !== "undefined" && options.body instanceof FormData;
  const token = csrfToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      ...(form || options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { "X-CSRF-TOKEN": token } : {}),
    },
    ...(options.body === undefined ? {} : { body: form ? options.body as FormData : JSON.stringify(options.body) }),
  });
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(response.status === 401 ? "scholardesk:auth-required" : "scholardesk:access-denied"));
    throw new ExpertAuthRequiredError(response.status === 401 ? "Sign in required" : "Access restricted");
  }
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  if (response.status === 204) return undefined as T;
  const payload = await response.json() as T | { data: T };
  return payload && typeof payload === "object" && "data" in payload ? payload.data : payload;
}
