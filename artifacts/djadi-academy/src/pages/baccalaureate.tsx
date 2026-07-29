import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, GraduationCap, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BAC_YEARS, BAC_BRANCHES, getBacExamUrl } from "@/lib/bac-data";

type Step = "year" | "branch" | "subject" | "exam";

export default function Baccalaureate() {
  const [step, setStep] = useState<Step>("year");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [examUrl, setExamUrl] = useState<string | null>(null);

  const selectedBranch = BAC_BRANCHES.find((b) => b.id === selectedBranchId);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep("branch");
  };

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);
    setStep("subject");
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    if (selectedYear && selectedBranchId) {
      const url = getBacExamUrl(selectedYear, selectedBranchId, subjectId);
      setExamUrl(url ?? null);
    }
    setStep("exam");
  };

  const goBack = () => {
    if (step === "branch") { setStep("year"); setSelectedBranchId(null); }
    else if (step === "subject") { setStep("branch"); setSelectedSubjectId(null); }
    else if (step === "exam") { setStep("subject"); setExamUrl(null); }
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

  const selectedSubject = selectedBranch?.subjects.find(
    (s) => s.id === selectedSubjectId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">البكالوريات السابقة</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">البكالوريات السابقة</h1>
            <p className="text-white/80 mt-1">اختر السنة والشعبة والمادة لفتح الامتحان</p>
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
              <h2 className="text-xl font-bold mb-4">اختر السنة</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {BAC_YEARS.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="bg-card border border-border rounded-2xl p-4 text-center font-bold text-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm hover:shadow-md"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Branch */}
          {step === "branch" && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                بكالوريا {selectedYear} — اختر الشعبة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {BAC_BRANCHES.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleBranchSelect(branch.id)}
                    className="bg-card border border-border rounded-2xl p-5 text-center font-bold text-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm hover:shadow-md group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20">
                      <GraduationCap className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    {branch.nameAr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Subject */}
          {step === "subject" && selectedBranch && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                بكالوريا {selectedYear} — {selectedBranch.nameAr} — اختر المادة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {selectedBranch.subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject.id)}
                    className="bg-card border border-border rounded-2xl p-5 text-right font-semibold text-base hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm hover:shadow-md flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/20">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    {subject.nameAr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Exam viewer */}
          {step === "exam" && (
            <div>
              <h2 className="text-xl font-bold mb-2">
                {selectedYear} — {selectedBranch?.nameAr} — {selectedSubject?.nameAr}
              </h2>

              {examUrl ? (
                <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-card">
                  <div className="flex items-center justify-between p-3 bg-muted border-b">
                    <span className="text-sm font-medium text-muted-foreground">الامتحان</span>
                    <a
                      href={examUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      فتح في نافذة جديدة
                    </a>
                  </div>
                  <iframe
                    src={examUrl}
                    title="exam"
                    className="w-full h-[60vh] sm:h-[72vh]"
                    allowFullScreen
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
