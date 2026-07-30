import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Loader2, ShieldAlert } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { clearUserCache } from "@/components/protected-route";
import { useLang } from "@/lib/language-context";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, isError, error } = useGetMe();
  const { tk } = useLang();

  const isAuthError = useMemo(() => {
    if (!isError) return false;
    const e = error as any;
    if (e?.status === 401 || e?.response?.status === 401) return true;
    if (e?.data?.error?.toLowerCase().includes("not authenticated")) return true;
    if (e?.data?.error?.toLowerCase().includes("session expired")) return true;
    return false;
  }, [isError, error]);

  useEffect(() => {
    if (!isLoading && (isAuthError || (!user && !isError))) {
      clearUserCache();
      setLocation("/login");
    }
  }, [user, isLoading, isAuthError, isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== "super_admin") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-background text-center p-8" dir="rtl">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">{tk("common.error")}</h1>
        <p className="text-muted-foreground">هذه الصفحة مخصصة للمديرين فقط.</p>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
