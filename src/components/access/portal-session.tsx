import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { API_BASE_URL } from "@/lib/api";

export type PortalAccessState = "checking" | "allowed" | "sign-in" | "wrong-account" | "unavailable";
interface PortalSessionValue { access: PortalAccessState; email: string | null; checkAccess: () => Promise<void>; }
const PortalSessionContext = createContext<PortalSessionValue | null>(null);

export function PortalSessionProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<PortalAccessState>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const checkAccess = useCallback(async () => {
    setAccess("checking");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include", cache: "no-store" });
      if (response.status === 401) { setAccess("sign-in"); return; }
      if (response.status === 403) { setAccess("wrong-account"); return; }
      if (!response.ok) { setAccess("unavailable"); return; }
      const payload = await response.json() as { user?: { role?: string; email?: string } };
      setEmail(payload.user?.email ?? null);
      setAccess((payload.user?.role === "expert" || payload.user?.role === "writer") ? "allowed" : "wrong-account");
    } catch { setAccess("unavailable"); }
  }, []);

  useEffect(() => {
    void checkAccess();
    const onAuthRequired = () => setAccess("sign-in");
    const onAccessDenied = () => void checkAccess();
    window.addEventListener("scholardesk:auth-required", onAuthRequired);
    window.addEventListener("scholardesk:access-denied", onAccessDenied);
    return () => {
      window.removeEventListener("scholardesk:auth-required", onAuthRequired);
      window.removeEventListener("scholardesk:access-denied", onAccessDenied);
    };
  }, [checkAccess]);
  const value = useMemo(() => ({ access, email, checkAccess }), [access, email, checkAccess]);
  return <PortalSessionContext.Provider value={value}>{children}</PortalSessionContext.Provider>;
}

export function usePortalSession() {
  const value = useContext(PortalSessionContext);
  if (!value) throw new Error("usePortalSession must be used within PortalSessionProvider");
  return value;
}