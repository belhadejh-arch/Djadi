import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useUpdateGrade, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const GRADES = [
  {
    id: "premiere" as const,
    titleAr: "أولى ثانوي",
    titleFr: "1ère Secondaire",
    color: "bg-blue-500",
    description: "الجذع المشترك والتأسيس العلمي والأدبي"
  },
  {
    id: "deuxieme" as const,
    titleAr: "ثانية ثانوي",
    titleFr: "2ème Secondaire",
    color: "bg-emerald-500",
    description: "التخصص والاستعداد للعام الختامي"
  },
  {
    id: "troisieme" as const,
    titleAr: "ثالثة ثانوي",
    titleFr: "3ème Secondaire (BAC)",
    color: "bg-amber-500",
    description: "سنة الحسم والتحضير للبكالوريا",
    badge: "BAC"
  }
];

export default function GradeSelect() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateGradeMutation = useUpdateGrade();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const handleSelectGrade = (gradeId: "premiere" | "deuxieme" | "troisieme") => {
    setSelectedGrade(gradeId);
    updateGradeMutation.mutate(
      { data: { grade: gradeId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/dashboard");
        },
        onError: () => {
          setSelectedGrade(null);
          toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: "لم نتمكن من تحديث المستوى الدراسي، يرجى المحاولة مرة أخرى",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-4 sm:p-6" dir="rtl">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-primary mb-2 sm:mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">اختر مستواك الدراسي</h1>
            <p className="text-muted-foreground text-sm sm:text-base" dir="ltr">Choisissez votre niveau d'études</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {GRADES.map((grade, index) => (
            <motion.div
              key={grade.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                onClick={() => handleSelectGrade(grade.id)}
                disabled={updateGradeMutation.isPending}
                className={`w-full text-right flex flex-col relative overflow-hidden rounded-2xl border-2 transition-all p-5 sm:p-6
                  ${selectedGrade === grade.id ? "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]" : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"}
                `}
              >
                {grade.badge && (
                  <div className="absolute top-3 left-3 bg-accent text-accent-foreground font-bold px-2.5 py-0.5 rounded-full text-xs shadow-sm" dir="ltr">
                    {grade.badge}
                  </div>
                )}
                
                <div className={`w-10 h-10 rounded-xl ${grade.color} text-white flex items-center justify-center mb-3`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold mb-1">{grade.titleAr}</h2>
                <h3 className="text-muted-foreground text-sm font-medium mb-2" dir="ltr">{grade.titleFr}</h3>
                
                <p className="text-xs text-muted-foreground mt-auto">{grade.description}</p>
                
                {selectedGrade === grade.id && updateGradeMutation.isPending && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
