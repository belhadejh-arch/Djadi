/**
 * LastActivity — shows the last viewed item per content type
 * (lesson / exam / test / homework) with a "Continue Studying" button.
 * Displayed as a card on the student dashboard.
 */
import { useQuery } from "@tanstack/react-query";
import { Clock, BookOpen, FileText, PenLine, Home, ArrowLeft, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "@/lib/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export type ContentType = "lesson" | "exam" | "test" | "homework";

const TYPE_META: Record<ContentType, {
  icon: React.ElementType;
  color: string;
  bg: string;
  activityKey: "activity.lastLesson" | "activity.lastExam" | "activity.lastTest" | "activity.lastHomework";
}> = {
  lesson:   { icon: BookOpen, activityKey: "activity.lastLesson",   color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30" },
  exam:     { icon: FileText, activityKey: "activity.lastExam",     color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  test:     { icon: PenLine,  activityKey: "activity.lastTest",     color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30" },
  homework: { icon: Home,     activityKey: "activity.lastHomework", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

function useLastActivity() {
  return useQuery({
    queryKey: ["activity", "recent"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/activity/recent`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
    staleTime: 30 * 1000,
  });
}

function getItemHref(act: any): string {
  const type: ContentType = act.contentType ?? "lesson";
  if (type === "lesson") return `/lessons/${act.lessonId ?? act.contentId}`;
  return `/subjects`;
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
  const { tk, lang } = useLang();
  const { data: activities = [], isLoading } = useLastActivity();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  if (activities.length === 0) return null;

  const mostRecent = activities.reduce((prev: any, curr: any) =>
    new Date(curr.viewedAt) > new Date(prev.viewedAt) ? curr : prev
  );

  return (
    <div className="space-y-3" dir="rtl">
      <h3 className="font-bold text-base flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        {tk("activity.lastActivity")}
      </h3>

      <div className="space-y-2">
        {activities.map((act: any) => {
          const type: ContentType = act.contentType ?? "lesson";
          const meta = TYPE_META[type] ?? TYPE_META.lesson;
          const Icon = meta.icon;
          const href = getItemHref(act);

          return (
            <Link key={act.id} href={href}>
              <div className="bg-card border border-border hover:border-primary/30 hover:shadow-sm rounded-2xl p-3 flex items-center gap-3 transition-all group cursor-pointer">
                <div className={`w-10 h-10 ${meta.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground mb-0.5">{tk(meta.activityKey)}</p>
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {act.lessonTitle ?? tk("common.item")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {act.subjectName && <span className="font-medium">{act.subjectName} · </span>}
                    {timeAgo(act.viewedAt, lang)}
                  </p>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      <Link href={getItemHref(mostRecent)}>
        <Button className="w-full gap-2 rounded-xl h-11 font-bold text-sm" variant="default">
          <PlayCircle className="w-4 h-4" />
          {tk("activity.continueStudy")}
        </Button>
      </Link>
    </div>
  );
}
