import { useGetMe, useGetDashboardSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Video, FileText, CheckCircle2, PlayCircle, Clock, BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: summary, isLoading } = useGetDashboardSummary();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 18) return "مساء الخير";
    return "مساء الخير";
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Welcome Hero */}
      <section className="bg-gradient-to-r from-primary to-emerald-800 rounded-2xl p-4 sm:p-6 md:p-8 text-primary-foreground shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold flex items-center gap-3 flex-wrap">
              {getGreeting()}، {user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-primary-foreground/80 text-base md:text-lg">
              مستعد لمواصلة رحلتك التعليمية اليوم؟
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 text-left w-full sm:w-auto" dir="ltr">
            <div>
              <p className="text-xs text-primary-foreground/70 font-semibold uppercase tracking-wider">Niveau</p>
              <p className="font-bold text-lg">{user?.grade === "troisieme" ? "3ème Année (BAC)" : user?.grade === "deuxieme" ? "2ème Année" : "1ère Année"}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
              {user?.grade === "troisieme" ? "B" : user?.grade === "deuxieme" ? "2" : "1"}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <Card className="border-none shadow-sm hover-elevate">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold leading-none">{summary?.totalSubjects || 0}</p>}
            <p className="text-xs font-medium text-muted-foreground">مواد مسجلة</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover-elevate">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1">
            <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold leading-none">{summary?.totalLessons || 0}</p>}
            <p className="text-xs font-medium text-muted-foreground">دروس مكتملة</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover-elevate">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1">
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold leading-none">{summary?.recentLessons?.filter(l => l.type === 'video').length || 0}</p>}
            <p className="text-xs font-medium text-muted-foreground">فيديو تعليمي</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover-elevate">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1">
            <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold leading-none">{summary?.recentLessons?.filter(l => l.type === 'pdf').length || 0}</p>}
            <p className="text-xs font-medium text-muted-foreground">ملف PDF</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subject Progress */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">تقدمك في المواد</h2>
            <Link href="/subjects" className="text-primary text-sm font-semibold hover:underline">عرض الكل</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </Card>
              ))
            ) : summary?.subjectProgress?.map((subject) => (
              <Link key={subject.subjectId} href={`/subjects/${subject.subjectId}`}>
                <Card className="p-3.5 border-none shadow-sm hover-elevate transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: subject.color }}>
                        <BookMarked className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{subject.subjectNameAr}</h3>
                        <p className="text-xs text-muted-foreground font-sans" dir="ltr">{subject.subjectName}</p>
                      </div>
                    </div>
                    <span className="font-bold text-base shrink-0">{subject.lessonCount} <span className="text-xs font-normal text-muted-foreground">درس</span></span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Lessons */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">آخر الدروس</h2>
            <Link href="/lessons" className="text-primary text-sm font-semibold hover:underline">الكل</Link>
          </div>
          
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 bg-card rounded-xl">
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : summary?.recentLessons?.slice(0, 4).map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <div className="flex gap-3 p-3 bg-card rounded-xl shadow-sm border border-border/50 hover-elevate transition-all group cursor-pointer">
                  <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${lesson.type === 'video' ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'}`}>
                    {lesson.type === 'video' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{lesson.titleAr}</h4>
                    <p className="text-xs text-muted-foreground truncate">{lesson.subjectName || lesson.subjectId}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {lesson.duration} د</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
