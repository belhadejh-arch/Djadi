import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { getBranchIdSync } from "@/lib/use-branch";

const USER_CACHE_KEY = "djadi_user_cache";

/** Persist authenticated user to localStorage so the session survives browser restarts. */
export function cacheUser(user: unknown) {
  try { localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user)); } catch {}
}

export function clearUserCache() {
  try { localStorage.removeItem(USER_CACHE_KEY); } catch {}
}

function getCachedUser(): any {
  try { return JSON.parse(localStorage.getItem(USER_CACHE_KEY) || "null"); } catch { return null; }
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError, error } = useGetMe();

  // Cache the user whenever we get a fresh response
  useEffect(() => {
    if (user) cacheUser(user);
  }, [user]);

  // Determine if this is a definitive auth failure (401) vs a transient network error
  const isAuthError = useMemo(() => {
    if (!isError) return false;
    const e = error as any;
    // HTTP status 401 → definitely not authenticated
    if (e?.status === 401 || e?.response?.status === 401) return true;
    // data.error from our API
    if (e?.data?.error?.toLowerCase().includes("not authenticated")) return true;
    if (e?.data?.error?.toLowerCase().includes("session expired")) return true;
    // Network error (fetch failed, server down) → treat as transient
    return false;
  }, [isError, error]);

  // Fall back to localStorage cache on transient network errors so the user
  // doesn't get kicked to the login page just because the server is temporarily down.
  const cachedUser = useMemo(() => getCachedUser(), []);
  const effectiveUser = user ?? (isError && !isAuthError ? cachedUser : null);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthError || (!effectiveUser)) {
      clearUserCache();
      setLocation("/login");
    } else if (effectiveUser?.role === "super_admin") {
      // Admin users go directly to /admin — skip grade/branch checks
      setLocation("/admin");
    } else if (effectiveUser && !effectiveUser.grade && location !== "/grade-select") {
      setLocation("/grade-select");
    } else if (
      effectiveUser?.grade &&
      !getBranchIdSync(effectiveUser.id, effectiveUser.grade) &&
      location !== "/branch-select"
    ) {
      setLocation("/branch-select");
    }
  }, [effectiveUser, isLoading, isAuthError, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!effectiveUser) {
    return null;
  }

  return <>{children}</>;
}
