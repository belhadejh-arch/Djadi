import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetLesson } from "@workspace/api-client-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ChevronRight, FileText, Clock, Calendar,
  ExternalLink, AlertCircle, Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FavoriteButton } from "@/components/favorite-button";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

// ── Record lesson view in activity log ───────────────────────────────────────
function useRecordActivity() {
  return useMutation({
    mutationFn: async (body: { lessonId: number; lessonTitle?: string; subjectName?: string }) => {
      await fetch(`${BASE_URL}/api/activity`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
  });
}

// ── Protected content fetch ───────────────────────────────────────────────────
function useLessonContent(id: number) {
  return useQuery({
    queryKey: ["lesson-content", id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/lessons/${id}/content`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json() as Promise<{ id: number; type: string; url: string | null; pdfUrl: string | null; videoUrl: string | null; linkUrl: string | null }>;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

// ── Content renderer ──────────────────────────────────────────────────────────
function ContentPlayer({ type, url, pdfUrl, videoUrl, linkUrl }: {
  type: string; url: string | null;
  pdfUrl: string | null; videoUrl: string | null; linkUrl: string | null;
}) {
  if (!url && !pdfUrl && !videoUrl && !linkUrl) {
    return (
      <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Lock className="w-12 h-12 opacity-40" />
        <p className="text-sm">المحتوى غير متاح حالياً</p>
      </div>
    );
  }

  if (type === "video" && videoUrl) {
    const isDirectVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl);
    return isDirectVideo ? (
      <div className="aspect-video bg-black select-none" onContextMenu={(e) => e.preventDefault()}>
        <video
          src={videoUrl}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          className="w-full h-full"
        />
      </div>
    ) : (
      <div className="aspect-video bg-black select-none" onContextMenu={(e) => e.preventDefault()}>
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          title="video"
        />
      </div>
    );
  }

  if (type === "pdf" && pdfUrl) {
    return (
      <div className="w-full bg-muted select-none h-[60vh] sm:h-[72vh]" onContextMenu={(e) => e.preventDefault()}>
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0`}
          className="w-full h-full border-0"
          title="document"
        />
      </div>
    );
  }

  if (linkUrl) {
    return (
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-4">
        <ExternalLink className="w-16 h-16 text-primary opacity-70" />
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          فتح الرابط
        </a>
      </div>
    );
  }

  return null;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LessonDetail() {
  const params = useParams();
  const lessonId = Number(params.id);

  const { data: lesson, isLoading } = useGetLesson(lessonId, {
    query: { enabled: !!lessonId, queryKey: [] },
  });
  const { data: content, isLoading: contentLoading } = useLessonContent(lessonId);
  const recordActivity = useRecordActivity();

  // Record view when lesson loads
  useEffect(() => {
    if (lesson && lessonId) {
      recordActivity.mutate({
        lessonId,
        lessonTitle: lesson.titleAr ?? lesson.title,
        subjectName: lesson.subjectName ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, lesson?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="p-8 text-center text-xl">الدرس غير موجود</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <Link href={`/subjects/${lesson.subjectId}`} className="hover:text-primary transition-colors">
          {lesson.subjectName}
        </Link>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <span className="text-foreground font-semibold truncate">{lesson.titleAr}</span>
      </nav>

      {/* Main card */}
      <div className="bg-card rounded-3xl overflow-hidden shadow-lg border border-border/50">
        {/* Content player */}
        {contentLoading ? (
          <Skeleton className="aspect-video w-full rounded-none" />
        ) : (
          <ContentPlayer
            type={content?.type ?? lesson.type}
            url={content?.url ?? null}
            pdfUrl={content?.pdfUrl ?? null}
            videoUrl={content?.videoUrl ?? null}
            linkUrl={content?.linkUrl ?? null}
          />
        )}

        {/* Meta */}
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge
              variant={lesson.type === "video" ? "destructive" : "default"}
              className="px-3 py-1 text-sm"
            >
              {lesson.type === "video" ? "فيديو" : lesson.type === "pdf" ? "مستند PDF" : "رابط"}
            </Badge>
            {lesson.subjectName && (
              <Badge variant="outline" className="px-3 py-1 text-sm bg-muted">
                {lesson.subjectName}
              </Badge>
            )}
            {/* Favorite button */}
            <div className="mr-auto">
              <FavoriteButton
                itemType="lesson"
                itemId={lesson.id}
                itemTitle={lesson.titleAr ?? lesson.title}
                size="md"
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{lesson.titleAr}</h1>
          <h2 className="text-xl text-muted-foreground font-sans tracking-wide mb-6" dir="ltr">
            {lesson.title}
          </h2>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-semibold">{lesson.duration} دقيقة</span>
            </div>
            {lesson.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold">
                  {format(new Date(lesson.createdAt), "dd MMMM yyyy")}
                </span>
              </div>
            )}
          </div>

          {lesson.description && (
            <div className="space-y-3 select-none">
              <h3 className="text-2xl font-bold">وصف الدرس</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {lesson.description}
              </p>
            </div>
          )}

          {/* Completion callout */}
          <div className="mt-10 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-lg mb-1">هل أتممت الدرس؟</h4>
                <p className="text-muted-foreground">
                  حدد الدرس كمكتمل لتحديث نسبة تقدمك في المادة.
                </p>
              </div>
            </div>
            <Button size="lg" className="rounded-xl px-8 w-full md:w-auto font-bold">
              تأكيد إتمام الدرس
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
