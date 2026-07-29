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
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full mb-4">
            <span>{grade ? GRADE_LABELS[grade] : ""}</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">اختر شعبتك</h1>
          <p className="text-muted-foreground text-lg" dir="ltr">
            Choisissez votre filière
          </p>
        </motion.div>

        {/* Branch grid */}
        <div
          className={`grid gap-4 ${
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
                  className="w-full text-right flex flex-col rounded-2xl border-2 border-border bg-card hover:border-primary/60 hover:bg-muted/40 hover:shadow-md transition-all p-6 group"
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: branch.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Name */}
                  <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {branch.nameAr}
                  </h2>
                  <p
                    className="text-sm text-muted-foreground font-sans"
                    dir="ltr"
                  >
                    {branch.nameFr}
                  </p>

                  {/* Subject count */}
                  <p className="text-xs text-muted-foreground mt-3">
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
