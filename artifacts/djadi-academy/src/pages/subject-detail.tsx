import { useParams, Link } from "wouter";
import { useGetSubject, useListLessons } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { BookOpen, Video, FileText, Clock, PlayCircle, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function SubjectDetail() {
  const params = useParams();
  const subjectId = Number(params.id);
  
  const { data: subject, isLoading: subjectLoading } = useGetSubject(subjectId, {
    query: { enabled: !!subjectId }
  });
  
  const { data: lessons, isLoading: lessonsLoading } = useListLessons({ subjectId }, {
    query: { enabled: !!subjectId }
  });

  if (subjectLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="grid gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!subject) return <div className="p-8 text-center text-xl">المادة غير موجودة</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/subjects" className="hover:text-primary transition-colors">المواد</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">{subject.nameAr}</span>
      </nav>

      {/* Hero Header */}
      <div 
        className="rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
        style={{ backgroundColor: subject.color || "hsl(var(--primary))" }}
      >
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent"></div>
        
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/30 shadow-inner">
          <BookOpen className="w-12 h-12" />
        </div>
        
        <div className="relative z-10 text-center md:text-right flex-1">
          <Badge variant="outline" className="text-white border-white/40 bg-white/10 mb-4" dir="ltr">{subject.nameFr || subject.name}</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{subject.nameAr}</h1>
          <p className="text-white/90 text-lg max-w-2xl">{subject.description || "استكشف دروس وتدريبات هذه المادة للتحضير لاختباراتك بكفاءة"}</p>
        </div>
        
        <div className="relative z-10 bg-white text-black p-4 rounded-2xl text-center min-w-[120px]">
          <p className="text-sm font-semibold text-muted-foreground">عدد الدروس</p>
          <p className="text-4xl font-extrabold" style={{ color: subject.color }}>{subject.lessonCount}</p>
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          محتوى المادة
        </h2>
        
        <div className="grid gap-4">
          {lessonsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
          ) : lessons?.length === 0 ? (
            <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
              لا توجد دروس حالياً في هذه المادة
            </div>
          ) : (
            lessons?.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/lessons/${lesson.id}`}>
                  <div className="bg-card p-4 md:p-6 rounded-2xl shadow-sm border border-border/50 hover-elevate transition-all flex flex-col md:flex-row md:items-center gap-4 group cursor-pointer">
                    
                    <div className={`w-16 h-16 shrink-0 rounded-xl flex items-center justify-center ${lesson.type === 'video' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {lesson.type === 'video' ? <PlayCircle className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{lesson.type === 'video' ? 'فيديو' : 'مستند'}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.duration} دقيقة
                        </span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{lesson.titleAr}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{lesson.description}</p>
                    </div>
                    
                    <div className="hidden md:flex shrink-0">
                      <Button variant="ghost" className="rounded-full w-12 h-12 p-0 group-hover:bg-primary group-hover:text-primary-foreground">
                        <ChevronRight className="w-6 h-6 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
