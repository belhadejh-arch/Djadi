import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetMe, useListBranches } from "@workspace/api-client-react";
import { ChevronRight, Loader2, BookOpen } from "lucide-react";
import { useBranch } from "@/lib/use-branch";

export default function BranchSelect() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useGetMe();
  const grade = user?.grade ?? undefined;

  const { data: branches = [], isLoading: branchesLoading } = useListBranches(
    grade ? { levelCode: grade } : undefined,
    { query: { enabled: !!grade, queryKey: ["branches", grade] } }
  );

  const { setBranch } = useBranch(user?.id, grade ?? null);

  const handleSelect = (branchId: number) => {
    setBranch(String(branchId));
    setLocation("/dashboard");
  };

  if (userLoading || (grade && branchesLoading)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Presentational grade label
  const gradeLabels: Record<string, string> = {
    premiere: "أولى ثانوي",
    deuxieme: "ثانية ثانوي",
    troisieme: "ثالثة ثانوي",
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6"
      dir="rtl"
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5 sm:mb-7"
        >
          {grade && (
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full mb-2.5">
              <span>{gradeLabels[grade] ?? grade}</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">اختر شعبتك</h1>
          <p className="text-muted-foreground text-sm sm:text-base" dir="ltr">
            Choisissez votre filière
          </p>
        </motion.div>

        {branches.length === 0 ? (
          <p className="text-center text-muted-foreground">لا توجد شعب متاحة لهذا المستوى</p>
        ) : (
          <div
            className={`grid gap-3 ${
              branches.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {branches.map((branch, index) => (
              <motion.div
                key={branch.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
              >
                <button
                  onClick={() => handleSelect(branch.id)}
                  className="w-full text-right flex flex-col rounded-2xl border-2 border-border bg-card hover:border-primary/60 hover:bg-muted/40 hover:shadow-md transition-all p-4 sm:p-5 group"
                >
                  {/* Icon placeholder (branches don't carry an icon in DB yet) */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200 bg-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>

                  {/* Name */}
                  <h2 className="text-base sm:text-lg font-bold mb-0.5 group-hover:text-primary transition-colors">
                    {branch.nameAr}
                  </h2>
                  <p className="text-xs text-muted-foreground font-sans" dir="ltr">
                    {branch.nameFr}
                  </p>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
