import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetSubject, useListLessons, useGetMe } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  Clock,
  PlayCircle,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  PenLine,
  Home,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getSubjectById } from "@/lib/branch-data";

type ContentTab = "lessons" | "assignments" | "exams" | "homework";
type Semester = "1" | "2" | "3";

const CONTENT_TABS: { id: ContentTab; labelAr: string; icon: React.ElementType; color: string }[] = [
  { id: "lessons", labelAr: "الدروس", icon: BookOpen, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { id: "assignments", labelAr: "الفروض", icon: ClipboardList, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { id: "exams", labelAr: "الاختبارات", icon: PenLine, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { id: "homework", labelAr: "الواجبات المنزلية", icon: Home, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
];

const SEMESTERS: { id: Semester; labelAr: string }[] = [
  { id: "1", labelAr: "الفصل الأول" },
  { id: "2", labelAr: "الفصل الثاني" },
  { id: "3", labelAr: "الفصل الثالث" },
];

export default function SubjectDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const rawId = params.id ?? "";
  const numericId = Number(rawId);
  const isNumeric = !isNaN(numericId) && rawId !== "";

  const [activeTab, setActiveTab] = useState<ContentTab>("lessons");
  const [activeSemester, setActiveSemester] = useState<Semester>("1");

  // API path: numeric IDs only
  const { data: apiSubject, isLoading: subjectLoading } = useGetSubject(
    numericId,
    { query: { enabled: isNumeric } }
  );
  const { data: lessons, isLoading: lessonsLoading } = useListLessons(
    { subjectId: numericId },
    { query: { enabled: isNumeric } }
  );
  const { data: user } = useGetMe();

  const isTroisieme = user?.grade === "troisieme";

  // Static path: string slugs (e.g. "arabic", "math", "german")
  const staticSubject = !isNumeric ? getSubjectById(rawId) : undefined;

  // Resolve whichever subject we have
  const subject = isNumeric
    ? apiSubject
      ? {
          nameAr: apiSubject.nameAr,
          nameFr: apiSubject.nameFr ?? apiSubject.name,
          description: apiSubject.description,
          color: apiSubject.color ?? "hsl(var(--primary))",
          lessonCount: apiSubject.lessonCount,
          icon: BookOpen,
        }
      : null
    : staticSubject
    ? {
        nameAr: staticSubject.nameAr,
        nameFr: staticSubject.nameFr,
        description: null,
        color: staticSubject.color,
        lessonCount: null,
        icon: staticSubject.icon,
      }
    : null;

  if (isNumeric && subjectLoading) {
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

  if (!subject) {
    return (
      <div className="p-8 text-center text-xl" dir="rtl">
        المادة غير موجودة
      </div>
    );
  }

  const SubjectIcon = subject.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary transition-colors">
          الرئيسية
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/subjects" className="hover:text-primary transition-colors">
          المواد
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">{subject.nameAr}</span>
      </nav>

      {/* Hero Header */}
      <div
        className="rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
        style={{ backgroundColor: subject.color }}
      >
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent" />

        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/30 shadow-inner">
          <SubjectIcon className="w-12 h-12" />
        </div>

        <div className="relative z-10 text-center md:text-right flex-1">
          <Badge
            variant="outline"
            className="text-white border-white/40 bg-white/10 mb-4"
            dir="ltr"
          >
            {subject.nameFr}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {subject.nameAr}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            {subject.description ??
              "استكشف دروس وتدريبات هذه المادة للتحضير لاختباراتك بكفاءة"}
          </p>
        </div>

        {subject.lessonCount !== null && (
          <div className="relative z-10 bg-white text-black p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-sm font-semibold text-muted-foreground">
              عدد الدروس
            </p>
            <p
              className="text-4xl font-extrabold"
              style={{ color: subject.color }}
            >
              {subject.lessonCount}
            </p>
          </div>
        )}
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CONTENT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl p-4 flex flex-col items-center gap-2 font-bold text-sm transition-all border-2 ${
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-primary/20" : tab.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs leading-tight text-center">{tab.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* Baccalaureates button — only for 3rd grade + exams tab */}
      {isTroisieme && activeTab === "exams" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => navigate("/baccalaureate")}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 flex items-center gap-4 hover:opacity-90 transition-opacity shadow-md"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="font-extrabold text-lg">بكالوريات سابقة</p>
              <p className="text-white/80 text-sm">امتحانات بكالوريا من 2008 إلى 2026</p>
            </div>
            <ChevronRight className="w-5 h-5 mr-auto rotate-180" />
          </button>
        </motion.div>
      )}

      {/* Semester Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SEMESTERS.map((sem) => (
          <button
            key={sem.id}
            onClick={() => setActiveSemester(sem.id)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeSemester === sem.id
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            {sem.labelAr}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          {CONTENT_TABS.find((t) => t.id === activeTab)?.labelAr} — {SEMESTERS.find((s) => s.id === activeSemester)?.labelAr}
        </h2>

        <div className="grid gap-4">
          {activeTab === "lessons" ? (
            // Show actual lesson data for lessons tab
            lessonsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))
            ) : !isNumeric || !lessons || lessons.length === 0 ? (
              <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
                لا توجد دروس حالياً في هذه المادة
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/lessons/${lesson.id}`}>
                    <div className="bg-card p-4 md:p-6 rounded-2xl shadow-sm border border-border/50 hover-elevate transition-all flex flex-col md:flex-row md:items-center gap-4 group cursor-pointer">
                      <div
                        className={`w-16 h-16 shrink-0 rounded-xl flex items-center justify-center ${
                          lesson.type === "video"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {lesson.type === "video" ? (
                          <PlayCircle className="w-8 h-8" />
                        ) : (
                          <FileText className="w-8 h-8" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {lesson.type === "video" ? "فيديو" : "مستند"}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lesson.duration} دقيقة
                          </span>
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {lesson.titleAr}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {lesson.description}
                        </p>
                      </div>
                      <div className="hidden md:flex shrink-0">
                        <Button
                          variant="ghost"
                          className="rounded-full w-12 h-12 p-0 group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                          <ChevronRight className="w-6 h-6 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )
          ) : (
            // Placeholder for other content types
            <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
              لا يوجد محتوى حالياً في {CONTENT_TABS.find((t) => t.id === activeTab)?.labelAr} للفصل الدراسي المختار
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
