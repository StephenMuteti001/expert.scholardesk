import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import api, { clearAuth } from "@/lib/api";
import { PORTALS } from "@/config/portals";
import type { PortalUser } from "@/types/portal";

interface AuthContextValue {
  user: PortalUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // const [user, setUser] = useState<PortalUser | null>(null);
  const sample_user = {
    id: 123,
    full_name: "Stephen Muteti",
    email: "stephen@gmail.com",
    phone: "0757090042",
    country: "Kenya",
    subscription_level: "expert",
    role: "expert",
    avatar: "My avatar" | null
  };
  const [user, setUser] = useState<PortalUser | null>(sample_user);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data?.user ?? data);
    } catch {
      setUser(null);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore network failure on logout */
    } finally {
      clearAuth();
      setUser(null);
      window.location.replace(PORTALS.AUTH);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh: load, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
