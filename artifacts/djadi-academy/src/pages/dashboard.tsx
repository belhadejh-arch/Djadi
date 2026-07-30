import { useGetMe, useGetDashboardSummary } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Video, FileText, CheckCircle2, PlayCircle, Clock, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LastActivity } from "@/components/last-activity";
import { useBranch } from "@/lib/use-branch";
import {
  getBranchById,
  THIRD_LANGUAGE_SUBJECTS,
  type GradeId,
  type SubjectDef,
} from "@/lib/branch-data";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const { data: summary, isLoading } = useGetDashboardSummary();

  const grade = user?.grade as GradeId | undefined;
  const { branchId, thirdLanguage } = useBranch(user?.id, grade);
  const branch = branchId ? getBranchById(branchId) : undefined;

  // Resolve subjects for the branch, filtered by grade
  const allSubjects: (SubjectDef & { linkTo: string })[] = (branch?.subjects ?? []).map((s) => {
    if (s.isThirdLanguagePlaceholder) {
      if (thirdLanguage) {
        const resolved = THIRD_LANGUAGE_SUBJECTS[thirdLanguage];
        return { ...resolved, linkTo: `/subjects/${resolved.id}` };
      }
      return { ...s, linkTo: "/language-select" };
    }
    return { ...s, linkTo: `/subjects/${s.id}` };
  });

  const displaySubjects =
    grade === "premiere" || grade === "deuxieme"
      ? allSubjects.filter((s) => s.id === "math")
      : allSubjects;

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
        {/* Subjects Grid — square cards */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">المواد الدراسية</h2>
            {branch && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-sans" dir="ltr">
                  {branch.nameFr}
                </span>
                <button
                  onClick={() => setLocation("/branch-select")}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  تغيير
                </button>
              </div>
            )}
          </div>

          {!branch ? (
            <div className="bg-card rounded-2xl border-2 border-dashed border-border/50 p-8 text-center" dir="rtl">
              <p className="text-muted-foreground mb-3">لم يتم اختيار شعبة بعد</p>
              <button
                onClick={() => setLocation("/branch-select")}
                className="text-primary font-semibold hover:underline text-sm"
              >
                اختر شعبتك الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {displaySubjects.map((subject, index) => {
                const Icon = subject.icon;
                const isThirdLangPicker = subject.isThirdLanguagePlaceholder && !thirdLanguage;
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <Link href={subject.linkTo}>
                      <div
                        className={`flex flex-col items-center justify-center rounded-2xl border-2 bg-card transition-all cursor-pointer group
                          h-24 sm:h-28 p-2 sm:p-3 text-center
                          ${isThirdLangPicker
                            ? "border-dashed border-pink-300 dark:border-pink-800 hover:border-pink-500"
                            : "border-border hover:border-primary/50 hover:shadow-md"
                          }`}
                      >
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white mb-1.5 sm:mb-2 shadow-sm group-hover:scale-110 transition-transform duration-200"
                          style={{ backgroundColor: subject.color }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <p className="text-[11px] sm:text-xs font-bold leading-tight text-center group-hover:text-primary transition-colors line-clamp-2">
                          {subject.nameAr}
                        </p>
                        {isThirdLangPicker && (
                          <span className="text-[10px] text-pink-500 font-medium mt-1 flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            اختر اللغة
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right column: Last Activity + Recent Lessons */}
        <section className="space-y-5">
          {/* Last Activity widget */}
          <LastActivity />

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

