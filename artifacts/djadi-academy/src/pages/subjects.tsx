import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetMe } from "@workspace/api-client-react";
import { useBranch } from "@/lib/use-branch";
import {
  getBranchById,
  THIRD_LANGUAGE_SUBJECTS,
  type GradeId,
  type SubjectDef,
} from "@/lib/branch-data";
import { Loader2, Languages } from "lucide-react";

export default function Subjects() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const grade = user?.grade as GradeId | undefined;

  const { branchId, thirdLanguage } = useBranch(user?.id, grade);
  const branch = branchId ? getBranchById(branchId) : undefined;

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center" dir="rtl">
        <p className="text-muted-foreground text-lg">لم يتم اختيار شعبة بعد</p>
        <button
          onClick={() => setLocation("/branch-select")}
          className="text-primary font-semibold hover:underline"
        >
          اختر شعبتك الآن
        </button>
      </div>
    );
  }

  // Resolve third-language placeholder if applicable
  const subjects: (SubjectDef & { linkTo: string })[] = branch.subjects.map(
    (s) => {
      if (s.isThirdLanguagePlaceholder) {
        if (thirdLanguage) {
          // Replace placeholder with the resolved language subject
          const resolved = THIRD_LANGUAGE_SUBJECTS[thirdLanguage];
          return { ...resolved, linkTo: `/subjects/${resolved.id}` };
        }
        // Show placeholder linking to language picker
        return { ...s, linkTo: "/language-select" };
      }
      return { ...s, linkTo: `/subjects/${s.id}` };
    }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المواد الدراسية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {branch.nameAr}
            <span className="mx-2 text-border">·</span>
            <button
              onClick={() => setLocation("/branch-select")}
              className="text-primary hover:underline"
            >
              تغيير الشعبة
            </button>
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full"
          dir="ltr"
        >
          <span className="font-semibold font-sans">{branch.nameFr}</span>
        </div>
      </div>

      {/* Subjects grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {subjects.map((subject, index) => {
          const Icon = subject.icon;
          const isThirdLangPicker =
            subject.isThirdLanguagePlaceholder && !thirdLanguage;

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Link href={subject.linkTo}>
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 bg-card transition-all cursor-pointer group
                    h-24 sm:h-28 md:h-28 p-2 sm:p-3 text-center
                    ${
                      isThirdLangPicker
                        ? "border-dashed border-pink-300 dark:border-pink-800 hover:border-pink-500"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    }
                  `}
                >
                  {/* Icon circle */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white mb-1.5 sm:mb-2 shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: subject.color }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Name */}
                  <p className="text-[11px] sm:text-xs font-bold leading-tight text-center group-hover:text-primary transition-colors line-clamp-2">
                    {subject.nameAr}
                  </p>

                  {/* Prompt for third language */}
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
    </div>
  );
}
