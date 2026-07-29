import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetMe } from "@workspace/api-client-react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useBranch } from "@/lib/use-branch";
import { getBranchesForGrade, type GradeId } from "@/lib/branch-data";

const GRADE_LABELS: Record<GradeId, string> = {
  premiere: "أولى ثانوي",
  deuxieme: "ثانية ثانوي",
  troisieme: "ثالثة ثانوي",
};

export default function BranchSelect() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const grade = user?.grade as GradeId | undefined;

  const { setBranch } = useBranch(user?.id, grade);

  const branches = grade ? getBranchesForGrade(grade) : [];

  const handleSelect = (branchId: string) => {
    setBranch(branchId);
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full mb-2.5">
            <span>{grade ? GRADE_LABELS[grade] : ""}</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">اختر شعبتك</h1>
          <p className="text-muted-foreground text-sm sm:text-base" dir="ltr">
            Choisissez votre filière
          </p>
        </motion.div>

        {/* Branch grid */}
        <div
          className={`grid gap-3 ${
            branches.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {branches.map((branch, index) => {
            const Icon = branch.icon;
            return (
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
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: branch.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Name */}
                  <h2 className="text-base sm:text-lg font-bold mb-0.5 group-hover:text-primary transition-colors">
                    {branch.nameAr}
                  </h2>
                  <p
                    className="text-xs text-muted-foreground font-sans"
                    dir="ltr"
                  >
                    {branch.nameFr}
                  </p>

                  {/* Subject count */}
                  <p className="text-xs text-muted-foreground mt-2">
                    {branch.subjects.length} مادة دراسية
                  </p>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
