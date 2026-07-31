import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, GraduationCap, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListBranches, useListSubjects } from "@workspace/api-client-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

// Baccalaureate is always السنة الثالثة ثانوي
const BAC_LEVEL_CODE = "troisieme";
const FIRST_BAC_YEAR = 2008;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - FIRST_BAC_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

interface BacPaper {
  id: number;
  year: number;
  branchId: number | null;
  subjectId: number | null;
  title: string | null;
  link: string;
}

// Single source of truth: same table the admin panel manages
function useBacPapers() {
  return useQuery({
    queryKey: ["baccalaureates"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/baccalaureates`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load baccalaureate papers");
      return res.json() as Promise<BacPaper[]>;
    },
    staleTime: 30 * 1000,
  });
}

type Step = "year" | "branch" | "subject" | "exam";

export default function Baccalaureate() {
  const [step, setStep] = useState<Step>("year");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const { data: papers } = useBacPapers();
  const { data: branches, isLoading: branchesLoading } = useListBranches(
    { levelCode: BAC_LEVEL_CODE },
    { query: { queryKey: ["branches", BAC_LEVEL_CODE] } }
  );
  const { data: allSubjects, isLoading: subjectsLoading } = useListSubjects(
    selectedBranchId ? { branchId: selectedBranchId } : undefined,
    { query: { enabled: !!selectedBranchId, queryKey: ["subjects", "bac", selectedBranchId] } }
  );

  const selectedBranch = branches?.find((b: any) => b.id === selectedBranchId);
  const subjects = allSubjects ?? [];
  const selectedSubject = (subjects as any[]).find((s) => s.id === selectedSubjectId);

  // The paper for the current selection (if the admin added one)
  const matchedPaper =
    selectedYear && selectedBranchId && selectedSubjectId
      ? papers?.find(
          (p) =>
            p.year === selectedYear &&
            p.branchId === selectedBranchId &&
            p.subjectId === selectedSubjectId
        )
      : undefined;
  const examUrl = matchedPaper?.link ?? null;

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep("branch");
  };

  const handleBranchSelect = (branchId: number) => {
    setSelectedBranchId(branchId);
    setSelectedSubjectId(null);
    setStep("subject");
  };

  const handleSubjectSelect = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setStep("exam");
  };

  const goBack = () => {
    if (step === "branch") { setStep("year"); setSelectedBranchId(null); }
    else if (step === "subject") { setStep("branch"); setSelectedSubjectId(null); }
    else if (step === "exam") { setStep("subject"); }
  };

  const stepLabels: Record<Step, string> = {
    year: "اختيار السنة",
    branch: "اختيار الشعبة",
    subject: "اختيار المادة",
    exam: "الامتحان",
  };

  const stepNumber: Record<Step, number> = {
    year: 1, branch: 2, subject: 3, exam: 4,
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">البكالوريات السابقة</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 md:p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold">البكالوريات السابقة</h1>
            <p className="text-white/80 text-xs sm:text-sm mt-0.5">اختر السنة والشعبة والمادة لفتح الامتحان</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
        {(["year", "branch", "subject", "exam"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                stepNumber[step] >= i + 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                step === s ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {stepLabels[s]}
            </span>
            {i < 3 && <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>

      {/* Back Button */}
      {step !== "year" && (
        <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          رجوع
        </Button>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Year */}
          {step === "year" && (
            <div>
              <h2 className="text-base font-bold mb-3">اختر السنة</h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {YEARS.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="bg-card border border-border rounded-xl p-2.5 text-center font-bold text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm hover:shadow-md"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Branch — from the shared catalog (same data as admin) */}
          {step === "branch" && (
            <div>
              <h2 className="text-base font-bold mb-3">
                بكالوريا {selectedYear} — اختر الشعبة
              </h2>
              {branchesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : !branches || branches.length === 0 ? (
                <div className="bg-card p-10 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
                  لا توجد شعب للسنة الثالثة ثانوي بعد
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {branches.map((branch: any) => (
                    <button
                      key={branch.id}
                      onClick={() => handleBranchSelect(branch.id)}
                      className="bg-card border border-border rounded-xl p-3.5 text-center font-semibold text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm hover:shadow-md group"
                    >
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-white/20">
                        <GraduationCap className="w-5 h-5 text-primary group-hover:text-white" />
                      </div>
                      {branch.nameAr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Subject — from the shared catalog (same data as admin) */}
          {step === "subject" && selectedBranch && (
            <div>
              <h2 className="text-base font-bold mb-3">
                بكالوريا {selectedYear} — {(selectedBranch as any).nameAr} — اختر المادة
              </h2>
              {subjectsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (subjects as any[]).length === 0 ? (
                <div className="bg-card p-10 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
                  لا توجد مواد لهذه الشعبة بعد
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {(subjects as any[]).map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject.id)}
                      className="bg-card border border-border rounded-xl p-3.5 text-right font-semibold text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm hover:shadow-md flex items-center gap-2.5"
                    >
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/20">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      {subject.nameAr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Exam viewer */}
          {step === "exam" && (
            <div>
              <h2 className="text-xl font-bold mb-2">
                {selectedYear} — {(selectedBranch as any)?.nameAr} — {selectedSubject?.nameAr}
              </h2>

              {examUrl ? (
                <div
                  className="rounded-2xl overflow-hidden border border-border shadow-lg bg-card select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between p-3 bg-muted border-b">
                    <span className="text-sm font-medium text-muted-foreground">الامتحان</span>
                  </div>
                  {/* examUrl is the internal protected path (/api/files/bac/:id) — viewed in-app only */}
                  <iframe
                    src={`${BASE_URL}${examUrl}#toolbar=0&navpanes=0`}
                    title="exam"
                    className="w-full h-[60vh] sm:h-[72vh] border-0"
                  />
                </div>
              ) : (
                <div className="bg-card border-2 border-dashed border-border rounded-2xl p-16 text-center space-y-3">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <X className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-bold text-muted-foreground">
                    الامتحان غير متاح بعد
                  </p>
                  <p className="text-sm text-muted-foreground">
                    لم يتم إضافة رابط هذا الامتحان من قبل الأدمن بعد
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
