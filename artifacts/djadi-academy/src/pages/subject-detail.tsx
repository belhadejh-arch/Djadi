import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetSubject, useListLessons, useGetMe } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen, FileText, PlayCircle, ChevronRight, GraduationCap,
  ClipboardList, PenLine, Home, Award, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getSubjectById } from "@/lib/branch-data";
import { PdfViewer } from "@/components/pdf-viewer";
import { useLang } from "@/lib/language-context";

type ContentTab = "lessons" | "assignments" | "exams" | "homework";
type Semester = "1" | "2" | "3";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const CONTENT_TABS: { id: ContentTab; labelAr: string; labelFr: string; labelEn: string; icon: React.ElementType; color: string }[] = [
  { id: "lessons",     labelAr: "الدروس",           labelFr: "Cours",       labelEn: "Lessons",   icon: BookOpen,      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { id: "assignments", labelAr: "الفروض",           labelFr: "Épreuves",    labelEn: "Exams",     icon: ClipboardList, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { id: "exams",       labelAr: "الاختبارات",        labelFr: "Tests",       labelEn: "Tests",     icon: PenLine,       color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { id: "homework",    labelAr: "الواجبات المنزلية", labelFr: "Devoirs",     labelEn: "Homework",  icon: Home,          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
];

const SEMESTERS: { id: Semester; labelAr: string; labelFr: string; labelEn: string }[] = [
  { id: "1", labelAr: "الفصل الأول",  labelFr: "1er Trimestre", labelEn: "Semester 1" },
  { id: "2", labelAr: "الفصل الثاني", labelFr: "2ème Trimestre", labelEn: "Semester 2" },
  { id: "3", labelAr: "الفصل الثالث", labelFr: "3ème Trimestre", labelEn: "Semester 3" },
];

// ── Fetch content items (exams / tests / homework) ─────────────────────────
function useContentItems(type: "exams" | "tests" | "homework", subjectId?: number, grade?: string) {
  return useQuery({
    queryKey: ["content", type, subjectId, grade],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (subjectId) q.set("subjectId", String(subjectId));
      if (grade) q.set("grade", grade);
      const res = await fetch(`${BASE_URL}/api/content/${type}?${q}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
    enabled: type === "exams" || type === "tests" || type === "homework",
    staleTime: 30 * 1000,
  });
}

// ── PDF Item Card ──────────────────────────────────────────────────────────
function ContentItemCard({
  item,
  index,
  color,
  onView,
}: {
  item: any;
  index: number;
  color: string;
  onView: (item: any) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => onView(item)}
        className="w-full bg-card p-4 rounded-2xl shadow-sm border border-border/50 hover:border-primary/40 hover:shadow-md transition-all flex items-center gap-4 group text-right"
      >
        <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${color}`}>
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
            {item.titleAr || item.title}
          </h3>
          {item.semester && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {SEMESTERS.find(s => s.id === String(item.semester))?.labelAr}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 text-xs">PDF</Badge>
      </button>
    </motion.div>
  );
}

export default function SubjectDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { t } = useLang();
  const rawId = params.id ?? "";
  const numericId = Number(rawId);
  const isNumeric = !isNaN(numericId) && rawId !== "";

  const [activeTab, setActiveTab] = useState<ContentTab>("lessons");
  const [activeSemester, setActiveSemester] = useState<Semester>("1");
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null);

  const { data: apiSubject, isLoading: subjectLoading } = useGetSubject(
    numericId,
    { query: { enabled: isNumeric } }
  );
  const { data: lessons, isLoading: lessonsLoading } = useListLessons(
    { subjectId: numericId },
    { query: { enabled: isNumeric && activeTab === "lessons" } }
  );
  const { data: user } = useGetMe();

  const { data: examItems, isLoading: examsLoading } = useContentItems(
    "exams", isNumeric ? numericId : undefined, user?.grade
  );
  const { data: testItems, isLoading: testsLoading } = useContentItems(
    "tests", isNumeric ? numericId : undefined, user?.grade
  );
  const { data: homeworkItems, isLoading: hwLoading } = useContentItems(
    "homework", isNumeric ? numericId : undefined, user?.grade
  );

  const isTroisieme = user?.grade === "troisieme";

  const staticSubject = !isNumeric ? getSubjectById(rawId) : undefined;

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
        {t("المادة غير موجودة", "Matière introuvable", "Subject not found")}
      </div>
    );
  }

  const SubjectIcon = subject.icon;

  // Filter content items by active semester (for assignments/exams/homework)
  const filteredExams    = (examItems ?? []).filter((i: any) => !i.semester || String(i.semester) === activeSemester);
  const filteredTests    = (testItems ?? []).filter((i: any) => !i.semester || String(i.semester) === activeSemester);
  const filteredHomework = (homeworkItems ?? []).filter((i: any) => !i.semester || String(i.semester) === activeSemester);

  const openPdf = (item: any) => {
    if (item.link) {
      setPdfViewer({ url: item.link, title: item.titleAr || item.title });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* PDF Viewer overlay */}
      {pdfViewer && (
        <PdfViewer
          url={pdfViewer.url}
          title={pdfViewer.title}
          onClose={() => setPdfViewer(null)}
        />
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary transition-colors">
          {t("الرئيسية", "Accueil", "Home")}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/subjects" className="hover:text-primary transition-colors">
          {t("المواد", "Matières", "Subjects")}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">{subject.nameAr}</span>
      </nav>

      {/* Hero Header */}
      <div
        className="rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-5 sm:gap-8"
        style={{ backgroundColor: subject.color }}
      >
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent" />

        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/30 shadow-inner">
          <SubjectIcon className="w-8 h-8 sm:w-12 sm:h-12" />
        </div>

        <div className="relative z-10 text-center md:text-right flex-1">
          <Badge variant="outline" className="text-white border-white/40 bg-white/10 mb-3 md:mb-4" dir="ltr">
            {subject.nameFr}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 md:mb-4">
            {subject.nameAr}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            {subject.description ?? t("استكشف دروس وتدريبات هذه المادة", "Explorez les cours de cette matière", "Explore lessons for this subject")}
          </p>
        </div>

        {subject.lessonCount !== null && (
          <div className="relative z-10 bg-white text-black p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-sm font-semibold text-muted-foreground">{t("عدد الدروس", "Cours", "Lessons")}</p>
            <p className="text-4xl font-extrabold" style={{ color: subject.color }}>{subject.lessonCount}</p>
          </div>
        )}
      </div>

      {/* Content Type Cards — 2x2 grid */}
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
              <span className="text-xs leading-tight text-center">
                {t(tab.labelAr, tab.labelFr, tab.labelEn)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Baccalaureates button — only for 3rd grade + exams tab */}
      {isTroisieme && activeTab === "exams" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <button
            onClick={() => navigate("/baccalaureate")}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 flex items-center gap-4 hover:opacity-90 transition-opacity shadow-md"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="font-extrabold text-lg">{t("بكالوريات سابقة", "Baccalauréats passés", "Past Baccalaureate")}</p>
              <p className="text-white/80 text-sm">{t("امتحانات بكالوريا من 2008 إلى 2026", "Examens bac de 2008 à 2026", "Bac exams from 2008 to 2026")}</p>
            </div>
            <ChevronRight className="w-5 h-5 mr-auto rotate-180" />
          </button>
        </motion.div>
      )}

      {/* Semester Tabs — shown for non-lesson tabs */}
      {activeTab !== "lessons" && (
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
              {t(sem.labelAr, sem.labelFr, sem.labelEn)}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          {t(
            CONTENT_TABS.find((t) => t.id === activeTab)?.labelAr ?? "",
            CONTENT_TABS.find((t) => t.id === activeTab)?.labelFr ?? "",
            CONTENT_TABS.find((t) => t.id === activeTab)?.labelEn ?? ""
          )}
          {activeTab !== "lessons" && ` — ${t(SEMESTERS.find(s => s.id === activeSemester)?.labelAr ?? "", SEMESTERS.find(s => s.id === activeSemester)?.labelFr ?? "", SEMESTERS.find(s => s.id === activeSemester)?.labelEn ?? "")}`}
        </h2>

        <div className="grid gap-4">
          {/* LESSONS */}
          {activeTab === "lessons" && (
            lessonsLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
              : !isNumeric || !lessons || lessons.length === 0
              ? (
                <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
                  {t("لا توجد دروس حالياً في هذه المادة", "Aucun cours disponible pour cette matière", "No lessons available for this subject")}
                </div>
              )
              : lessons.map((lesson: any, index: number) => (
                <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <a
                    href={`${import.meta.env.BASE_URL}lessons/${lesson.id}`}
                    onClick={(e) => { e.preventDefault(); navigate(`/lessons/${lesson.id}`); }}
                  >
                    <div className="bg-card p-4 md:p-6 rounded-2xl shadow-sm border border-border/50 hover:border-primary/40 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4 group cursor-pointer">
                      <div className={`w-16 h-16 shrink-0 rounded-xl flex items-center justify-center ${
                        lesson.type === "video"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                        {lesson.type === "video" ? <PlayCircle className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {lesson.type === "video" ? t("فيديو", "Vidéo", "Video") : t("مستند", "Document", "Document")}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lesson.duration} {t("دقيقة", "min", "min")}
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
                  </a>
                </motion.div>
              ))
          )}

          {/* EXAMS (الفروض) */}
          {activeTab === "assignments" && (
            examsLoading
              ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
              : filteredExams.length === 0
              ? (
                <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
                  {t("لا توجد فروض حالياً لهذه المادة في هذا الفصل", "Aucune épreuve disponible", "No exams available")}
                </div>
              )
              : filteredExams.map((item: any, index: number) => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  onView={openPdf}
                />
              ))
          )}

          {/* TESTS (الاختبارات) */}
          {activeTab === "exams" && (
            testsLoading
              ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
              : filteredTests.length === 0
              ? (
                <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
                  {t("لا توجد اختبارات حالياً لهذه المادة في هذا الفصل", "Aucun test disponible", "No tests available")}
                </div>
              )
              : filteredTests.map((item: any, index: number) => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  onView={openPdf}
                />
              ))
          )}

          {/* HOMEWORK (الواجبات المنزلية) */}
          {activeTab === "homework" && (
            hwLoading
              ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
              : filteredHomework.length === 0
              ? (
                <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
                  {t("لا توجد واجبات منزلية حالياً لهذه المادة في هذا الفصل", "Aucun devoir disponible", "No homework available")}
                </div>
              )
              : filteredHomework.map((item: any, index: number) => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  onView={openPdf}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
