import { useState, type ReactNode } from "react";
import { API_BASE_URL, AUTH_PORTAL_URL } from "@/lib/api";
import { buildAuthUrl, switchAccount } from "@/lib/auth-return";
import { AccessCard } from "./AccessCard";
import { usePortalSession } from "./portal-session";

/** Guard rendered INSIDE the expert shell, so navigation stays visible. The API owns access. */
export function PortalAccess({ children }: { children: ReactNode }) {
  const { access, checkAccess, email } = usePortalSession();
  const [switching, setSwitching] = useState(false);
  if (access === "allowed") return <>{children}</>;
  return (
    <AccessCard
      state={access}
      portalLabel="Expert portal"
      accountNoun="expert"
      markSrc="/favicon-192.png"
      signInHref={buildAuthUrl(AUTH_PORTAL_URL)}
      register={{ href: buildAuthUrl(AUTH_PORTAL_URL, { mode: "register", registerPath: "/register/writer" }), label: "Apply as an expert" }}
      signedInAs={email}
      onRetry={() => void checkAccess()}
      onSwitchAccount={() => { setSwitching(true); void switchAccount(API_BASE_URL, AUTH_PORTAL_URL); }}
      switching={switching}
      footer={<>Need help? Email <a className="font-semibold text-primary hover:underline" href="mailto:support@scholardesk.pro">support@scholardesk.pro</a></>}
    />
  );
}
