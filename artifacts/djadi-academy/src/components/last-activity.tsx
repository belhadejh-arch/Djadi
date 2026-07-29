/**
 * LastActivity — shows the most recent lesson views for the current user
 * Displayed as a card on the student dashboard.
 */
import { useQuery } from "@tanstack/react-query";
import { Clock, BookOpen, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "@/lib/language-context";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function useRecentActivity(limit = 5) {
  return useQuery({
    queryKey: ["activity", "recent", limit],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/activity/recent?limit=${limit}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
    staleTime: 30 * 1000,
  });
}

function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) {
    if (lang === "ar") return `منذ ${diff} ثانية`;
    if (lang === "fr") return `il y a ${diff}s`;
    return `${diff}s ago`;
  }
  const mins = Math.floor(diff / 60);
  if (mins < 60) {
    if (lang === "ar") return `منذ ${mins} دقيقة`;
    if (lang === "fr") return `il y a ${mins} min`;
    return `${mins} min ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    if (lang === "ar") return `منذ ${hrs} ساعة`;
    if (lang === "fr") return `il y a ${hrs}h`;
    return `${hrs}h ago`;
  }
  const days = Math.floor(hrs / 24);
  if (lang === "ar") return `منذ ${days} يوم`;
  if (lang === "fr") return `il y a ${days} j`;
  return `${days}d ago`;
}

export function LastActivity() {
  const { t, lang } = useLang();
  const { data: activities = [], isLoading } = useRecentActivity(5);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          {t("آخر نشاط", "Dernière activité", "Last Activity")}
        </h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-base flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        {t("آخر نشاط", "Dernière activité", "Last Activity")}
      </h3>
      <div className="space-y-2">
        {activities.map((act: any) => (
          <Link key={act.id} href={`/lessons/${act.lessonId}`}>
            <div className="bg-card border border-border hover:border-primary/30 hover:shadow-sm rounded-xl p-3 flex items-center gap-3 transition-all group cursor-pointer">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {act.lessonTitle ?? t("درس", "Cours", "Lesson")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {act.subjectName && <span className="font-medium">{act.subjectName} · </span>}
                  {timeAgo(act.viewedAt, lang)}
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
