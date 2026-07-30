import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetMe, useListSubjects } from "@workspace/api-client-react";
import { useBranch } from "@/lib/use-branch";
import { Loader2 } from "lucide-react";

export default function Subjects() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useGetMe();
  const grade = user?.grade ?? undefined;

  const { branchId } = useBranch(user?.id, grade ?? null);
  const branchIdNum = branchId ? parseInt(branchId) : undefined;
  const validBranchId = branchIdNum && !isNaN(branchIdNum) ? branchIdNum : undefined;

  const { data: subjects = [], isLoading: subjectsLoading } = useListSubjects(
    validBranchId !== undefined ? { branchId: validBranchId } : undefined,
    { query: { enabled: !!grade } }
  );

  if (userLoading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!validBranchId) {
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

  // Grade label for header
  const gradeLabels: Record<string, string> = {
    premiere: "أولى ثانوي",
    deuxieme: "ثانية ثانوي",
    troisieme: "ثالثة ثانوي",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المواد الدراسية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {grade ? gradeLabels[grade] ?? grade : ""}
            <span className="mx-2 text-border">·</span>
            <button
              onClick={() => setLocation("/branch-select")}
              className="text-primary hover:underline"
            >
              تغيير الشعبة
            </button>
          </p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-muted-foreground">لا توجد مواد متاحة حتى الآن</p>
          <p className="text-xs text-muted-foreground">سيضيفها المدير قريباً</p>
        </div>
      ) : (
        /* Subjects grid */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Link href={`/subjects/${subject.id}`}>
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-card transition-all cursor-pointer group h-24 sm:h-28 md:h-28 p-2 sm:p-3 text-center hover:border-primary/50 hover:shadow-md">
                  {/* Icon / emoji */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white mb-1.5 sm:mb-2 shadow-sm group-hover:scale-110 transition-transform duration-200 text-lg"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.icon}
                  </div>

                  {/* Name */}
                  <p className="text-[11px] sm:text-xs font-bold leading-tight text-center group-hover:text-primary transition-colors line-clamp-2">
                    {subject.nameAr}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
