import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { getBranchIdSync } from "@/lib/use-branch";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe();

  useEffect(() => {
    if (!isLoading) {
      if (isError || !user) {
        setLocation("/login");
      } else if (!user.grade && location !== "/grade-select") {
        setLocation("/grade-select");
      } else if (
        user.grade &&
        !getBranchIdSync(user.id, user.grade) &&
        location !== "/branch-select"
      ) {
        setLocation("/branch-select");
      }
    }
  }, [user, isLoading, isError, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <>{children}</>;
}
