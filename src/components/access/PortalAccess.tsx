import { useCallback, useEffect, useState, type ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, AUTH_PORTAL_URL } from "@/lib/api";
const apiBase = API_BASE_URL;

type Access = "checking" | "allowed" | "sign-in" | "wrong-account" | "unavailable";
const allowedRoles = ["expert"];

/** The API owns the session; no browser storage or UI state can grant access. */
export function PortalAccess({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>("checking");
  const checkAccess = useCallback(async () => {
    setAccess("checking");
    try {
      const response = await fetch(`${apiBase}/auth/me`, { credentials: "include", cache: "no-store" });
      if (response.status === 401) { setAccess("sign-in"); return; }
      if (response.status === 403) { setAccess("wrong-account"); return; }
      if (!response.ok) { setAccess("unavailable"); return; }
      const payload = await response.json() as { user?: { role?: string } };
      setAccess(payload.user?.role && allowedRoles.includes(payload.user.role) ? "allowed" : "wrong-account");
    } catch { setAccess("unavailable"); }
  }, []);

  useEffect(() => {
    void checkAccess();
    const onAuthRequired = () => setAccess("sign-in");
    const onAccessDenied = () => { void checkAccess(); };
    window.addEventListener("scholardesk:auth-required", onAuthRequired);
    window.addEventListener("scholardesk:access-denied", onAccessDenied);
    return () => {
      window.removeEventListener("scholardesk:auth-required", onAuthRequired);
      window.removeEventListener("scholardesk:access-denied", onAccessDenied);
    };
  }, [checkAccess]);

  if (access === "allowed") return <>{children}</>;
  if (access === "checking") return <main aria-live="polite" className="flex min-h-screen items-center justify-center bg-background p-6 text-muted-foreground">Checking access…</main>;

  const title = access === "sign-in" ? "Sign in required" : access === "wrong-account" ? "Access restricted" : "Unable to check access";
  const detail = access === "sign-in"
    ? "Please sign in to your ScholarDesk expert account to open this page."
    : access === "wrong-account"
      ? "This page requires a ScholarDesk expert account. If you use another account, switch accounts and try again."
      : "We could not verify your account right now. Check your connection and try again.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section role="alert" aria-live="assertive" className="w-full max-w-md border-primary pt-8 text-foreground">
        <LockKeyhole aria-hidden="true" className="mb-5 size-9 text-primary" />
        <p className="mb-2 text-sm font-semibold text-primary">ScholarDesk · Expert portal</p>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{detail}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {access !== "unavailable" && <Button asChild><a href={AUTH_PORTAL_URL}>Go to sign in</a></Button>}
          <Button variant="outline" onClick={() => void checkAccess()}>Try again</Button>
        </div>
      </section>
    </main>
  );
}
