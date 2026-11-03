/**
 * ScholarDesk API client.
 *
 * Preserves the transport contract of the existing platform:
 *  - same base URL (VITE_API_URL, default https://api.scholardesk.pro/api/v1)
 *  - cookie based sessions (credentials: "include")
 *  - CSRF double-submit using the `csrf_access_token` cookie -> `X-CSRF-TOKEN`
 *  - 401/403 redirect back to the auth portal
 *
 * See docs/API.md for the endpoints this portal expects.
 */

export const API_BASE_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ??
  "https://api.scholardesk.pro/api/v1";

/** Origin of the API host, without the /api/v1 version prefix. Used to
 *  resolve relative file URLs (e.g. attachment download links). */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

export const AUTH_PORTAL_URL =
  (import.meta.env["VITE_AUTH_PORTAL_URL"] as string | undefined) ??
  "https://auth.scholardesk.pro";

/** Human-readable message for any error thrown by this client. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

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

/** Serialize request params to a query string, skipping empty values. */
function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function apiRequest<T = any>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    params?: Record<string, unknown>;
    signal?: AbortSignal | undefined;
  } = {},
): Promise<T> {
  const { method = "GET", body, params, signal } = options;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
  const token = csrfToken();
  if (token) headers["X-CSRF-TOKEN"] = token;

  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    method,
    credentials: "include",
    headers,
    ...(signal ? { signal } : {}),
    ...(body !== undefined ? { body: isForm ? (body as FormData) : JSON.stringify(body) } : {}),
  });

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(response.status === 401 ? "scholardesk:auth-required" : "scholardesk:access-denied"));
    throw new ApiError(response.status, response.status === 401 ? "Sign in required" : "Access restricted");
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

/** Clears any locally cached auth state (cookie sessions live server-side). */
export function clearAuth(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem("scholardesk:user");
}

export const api = {
  get: <T = any>(path: string, options: { params?: Record<string, unknown>; signal?: AbortSignal } = {}) =>
    apiRequest<T>(path, { ...options }),
  post: <T = any>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T = any>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T = any>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

export default api;
