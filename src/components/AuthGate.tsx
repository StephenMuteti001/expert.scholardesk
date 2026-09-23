import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { PORTALS } from "@/config/portals";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     window.location.replace(PORTALS.AUTH);
  //   }
  // }, [isLoading, user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
