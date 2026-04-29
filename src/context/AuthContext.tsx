import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import { apiGet, apiPost } from "@/lib/api";
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";

interface AuthContextType {
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (role: string, token: string) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  recordActivity: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Record user activity (called from axios interceptor and user events).
   * Resets the idle timeout timer.
   */
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * Check if the user has a valid session by calling GET /api/auth/me.
   * This endpoint validates the HttpOnly JWT cookie and returns the user's role.
   */
  const refreshAuth = useCallback(async () => {
    try {
      const data = await apiGet<{ role: string; message: string }>("/api/auth/me");
      if (data && data.role) {
        setRole(data.role);
        setIsAuthenticated(true);
        setSessionExpired(false);
      } else {
        setRole(null);
        setIsAuthenticated(false);
      }
    } catch {
      setRole(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount, verify existing session
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  /**
   * Idle timeout detection: checks every 60s if user has been idle too long.
   * If idle for more than IDLE_TIMEOUT_MS, shows the session expired modal.
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkIdle = () => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= IDLE_TIMEOUT_MS) {
        setSessionExpired(true);
        setIsAuthenticated(false);
        setRole(null);
        localStorage.removeItem('accessToken');
      }
    };

    idleTimerRef.current = setInterval(checkIdle, 60_000);

    // Track user activity via mouse/keyboard
    const onActivity = () => recordActivity();
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [isAuthenticated, recordActivity]);

  /**
   * Periodic heartbeat: every 5 minutes, verify session is still valid on the server.
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const heartbeat = setInterval(async () => {
      try {
        await apiGet<{ role: string }>("/api/auth/me");
        recordActivity();
      } catch {
        setSessionExpired(true);
        setIsAuthenticated(false);
        setRole(null);
        localStorage.removeItem('accessToken');
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(heartbeat);
  }, [isAuthenticated, recordActivity]);

  const login = (role: string, token: string) => {
    localStorage.setItem('accessToken', token);
    setRole(role);
    setIsAuthenticated(true);
    setIsLoading(false);
    setSessionExpired(false);
    recordActivity();
  };

  const logout = async () => {
    try {
      await apiPost("/api/auth/logout", {});
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('accessToken');
    setRole(null);
    setIsAuthenticated(false);
  };

  const handleSessionRelogin = () => {
    setSessionExpired(false);
    window.location.href = "/auth";
  };

  const value = useMemo(() => ({
    role,
    isAuthenticated,
    isLoading,
    sessionExpired,
    login,
    logout,
    refreshAuth,
    recordActivity,
  }), [role, isAuthenticated, isLoading, sessionExpired, refreshAuth, recordActivity]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal open={sessionExpired} onLogin={handleSessionRelogin} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
