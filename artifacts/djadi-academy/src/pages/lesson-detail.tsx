import { useParams, Link } from "wouter";
import { useGetLesson } from "@workspace/api-client-react";
import { ChevronRight, Play, FileText, Clock, Calendar, Download, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function LessonDetail() {
  const params = useParams();
  const lessonId = Number(params.id);

  const { data: lesson, isLoading } = useGetLesson(lessonId, {
    query: { enabled: !!lessonId }
  });

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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/subjects/${lesson.subjectId}`} className="hover:text-primary transition-colors">{lesson.subjectName}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold truncate">{lesson.titleAr}</span>
      </nav>

      {/* Main Content Area */}
      <div className="bg-card rounded-3xl overflow-hidden shadow-lg border border-border/50">
        
        {/* Player / Document Viewer Placeholder */}
        <div className="aspect-video bg-black relative flex items-center justify-center group">
          {lesson.type === 'video' ? (
            <>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=1600&q=80')] bg-cover bg-center opacity-40"></div>
              <Button size="icon" className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary hover:scale-110 transition-all z-10">
                <Play className="w-10 h-10 ml-2" />
              </Button>
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-1 flex-1 bg-white/30 rounded-full mx-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"></div>
                </div>
                <span className="text-white text-sm font-mono" dir="ltr">12:04 / {lesson.duration}:00</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-white/80 z-10">
              <FileText className="w-24 h-24 mb-4" />
              <Button size="lg" className="rounded-xl px-8 font-bold text-lg">
                <Download className="mr-2 w-5 h-5" /> تحميل الملف
              </Button>
            </div>
          )}
        </div>

        {/* Content Meta */}
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={lesson.type === 'video' ? "destructive" : "default"} className="px-3 py-1 text-sm">
              {lesson.type === 'video' ? 'فيديو' : 'مستند PDF'}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm bg-muted">
              {lesson.subjectName}
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{lesson.titleAr}</h1>
          <h2 className="text-xl text-muted-foreground font-sans tracking-wide mb-6" dir="ltr">{lesson.title}</h2>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-semibold">{lesson.duration} دقيقة</span>
            </div>
            {lesson.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold">{format(new Date(lesson.createdAt), 'dd MMMM yyyy')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold">وصف الدرس</h3>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {lesson.description || "هذا الدرس يغطي المفاهيم الأساسية والمتقدمة في الموضوع بطريقة مبسطة واحترافية. ننصحك بتحضير ورقة وقلم وتدوين الملاحظات لضمان الاستفادة القصوى."}
            </p>
          </div>

          {/* Action Callout */}
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">هل أتممت الدرس؟</h4>
                <p className="text-muted-foreground">حدد الدرس كمكتمل لتحديث نسبة تقدمك في المادة.</p>
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
