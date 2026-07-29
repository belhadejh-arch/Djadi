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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6" dir="rtl">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">اختر مستواك الدراسي</h1>
            <p className="text-muted-foreground text-lg" dir="ltr">Choisissez votre niveau d'études</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className={`w-full text-right flex flex-col relative overflow-hidden rounded-2xl border-2 transition-all p-8
                  ${selectedGrade === grade.id ? "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]" : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"}
                `}
              >
                {grade.badge && (
                  <div className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold px-3 py-1 rounded-full text-sm shadow-sm" dir="ltr">
                    {grade.badge}
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl ${grade.color} text-white flex items-center justify-center mb-6`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{grade.titleAr}</h2>
                <h3 className="text-muted-foreground font-medium mb-4" dir="ltr">{grade.titleFr}</h3>
                
                <p className="text-sm text-muted-foreground mt-auto">{grade.description}</p>
                
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
