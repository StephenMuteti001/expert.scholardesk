/**
 * Builds links to the ScholarDesk auth site that bring the user back to
 * the exact page they were on (path + query + hash) after signing in.
 * The auth site validates `return_to` against this portal's origin.
 */
export function buildAuthUrl(
  authPortalUrl: string,
  options: { mode?: "login" | "register"; registerPath?: string; returnTo?: string } = {},
): string {
  const here = typeof window === "undefined" ? undefined : window.location.href;
  const origin = typeof window === "undefined" ? undefined : window.location.origin;
  const url = new URL(options.mode === "register" ? (options.registerPath ?? "/register") : "/", authPortalUrl);
  const target = options.returnTo ?? here;
  if (target && origin) {
    const destination = new URL(target, origin);
    // Never forward a destination outside this portal.
    url.searchParams.set("return_to", destination.origin === origin ? destination.toString() : origin);
  }
  return url.toString();
}

function csrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Ends the current session, then opens sign-in with a return link to this page. */
export async function switchAccount(apiBaseUrl: string, authPortalUrl: string): Promise<void> {
  const token = csrfToken();
  try {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: token ? { "X-CSRF-TOKEN": token } : {},
    });
  } catch {
    /* signing in again replaces the session anyway */
  }
  window.location.assign(buildAuthUrl(authPortalUrl));
}
