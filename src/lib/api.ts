/**
 * ScholarDesk API client.
 *
 * Preserves the transport contract of the existing platform:
 *  - same base URL (VITE_API_URL, default https://api.academichubpro.com/api/v1)
 *  - cookie based sessions (credentials: "include")
 *  - CSRF double-submit using the `csrf_access_token` cookie -> `X-CSRF-TOKEN`
 *  - 401/403 redirect back to the auth portal
 *
 * See docs/API.md for the endpoints this portal expects.
 */

export const API_BASE_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ??
  "https://api.academichubpro.com/api/v1";

export const AUTH_PORTAL_URL =
  (import.meta.env["VITE_AUTH_PORTAL_URL"] as string | undefined) ??
  "https://scholardesk.pro";

function csrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let isRedirecting = false;

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal | undefined } = {},
): Promise<T> {
  const { method = "GET", body, signal } = options;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
  const token = csrfToken();
  if (token) headers["X-CSRF-TOKEN"] = token;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    ...(signal ? { signal } : {}),
    ...(body !== undefined ? { body: isForm ? (body as FormData) : JSON.stringify(body) } : {}),
  });

  if (response.status === 401 || response.status === 403) {
    if (!isRedirecting && typeof window !== "undefined") {
      isRedirecting = true;
      window.location.replace(AUTH_PORTAL_URL);
    }
    throw new ApiError(response.status, "Not authenticated");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

export default api;
