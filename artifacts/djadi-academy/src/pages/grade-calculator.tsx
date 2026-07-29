import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Subject {
  id: number;
  name: string;
  grade: string;
  coefficient: string;
}

let idCounter = 1;

function newSubject(): Subject {
  return { id: idCounter++, name: "", grade: "", coefficient: "1" };
}

export default function GradeCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([newSubject(), newSubject(), newSubject()]);

  const addSubject = () => setSubjects((prev) => [...prev, newSubject()]);

  const removeSubject = (id: number) =>
    setSubjects((prev) => prev.filter((s) => s.id !== id));

  const update = (id: number, field: keyof Subject, value: string) =>
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );

  const reset = () => setSubjects([newSubject(), newSubject(), newSubject()]);

  const calculate = () => {
    let totalWeighted = 0;
    let totalCoeff = 0;
    for (const s of subjects) {
      const g = parseFloat(s.grade);
      const c = parseFloat(s.coefficient);
      if (!isNaN(g) && !isNaN(c) && c > 0) {
        totalWeighted += g * c;
        totalCoeff += c;
      }
    }
    if (totalCoeff === 0) return null;
    return (totalWeighted / totalCoeff).toFixed(2);
  };

  const average = calculate();
  const averageNum = average ? parseFloat(average) : null;

  const getAverageColor = (avg: number) => {
    if (avg >= 14) return "text-emerald-600 dark:text-emerald-400";
    if (avg >= 10) return "text-blue-600 dark:text-blue-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAverageLabel = (avg: number) => {
    if (avg >= 16) return "ممتاز";
    if (avg >= 14) return "جيد جداً";
    if (avg >= 12) return "جيد";
    if (avg >= 10) return "مقبول";
    return "ضعيف";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Calculator className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">حساب المعدل</h1>
            <p className="text-white/80 mt-1">أدخل درجاتك ومعاملاتها لحساب معدلك</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-sm font-bold text-muted-foreground border-b">
              <span className="col-span-5">المادة</span>
              <span className="col-span-3 text-center">الدرجة / 20</span>
              <span className="col-span-3 text-center">المعامل</span>
              <span className="col-span-1" />
            </div>

            <div className="divide-y divide-border">
              {subjects.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-12 gap-2 p-3 items-center"
                >
                  <div className="col-span-5">
                    <Input
                      placeholder={`مادة ${i + 1}`}
                      value={s.name}
                      onChange={(e) => update(s.id, "name", e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      placeholder="0"
                      value={s.grade}
                      onChange={(e) => update(s.id, "grade", e.target.value)}
                      className="text-sm h-9 text-center"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="1"
                      value={s.coefficient}
                      onChange={(e) => update(s.id, "coefficient", e.target.value)}
                      className="text-sm h-9 text-center"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeSubject(s.id)}
                      disabled={subjects.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={addSubject} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إضافة مادة
            </Button>
            <Button variant="ghost" onClick={reset} className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              إعادة تعيين
            </Button>
          </div>
        </div>

        {/* Result Card */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm space-y-4">
            <p className="text-muted-foreground font-semibold">معدلك الإجمالي</p>
            {averageNum !== null ? (
              <>
                <p className={`text-6xl font-extrabold ${getAverageColor(averageNum)}`}>
                  {average}
                </p>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                  averageNum >= 10
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                }`}>
                  {getAverageLabel(averageNum)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {averageNum >= 10 ? "ناجح ✓" : "راسب ✗"}
                </p>
              </>
            ) : (
              <p className="text-4xl font-extrabold text-muted-foreground">—</p>
            )}
          </div>

          {/* Scale reference */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-2 text-sm">
            <p className="font-bold text-muted-foreground mb-3">سلم التقديرات</p>
            {[
              { range: "16 - 20", label: "ممتاز", color: "bg-emerald-500" },
              { range: "14 - 15.99", label: "جيد جداً", color: "bg-teal-500" },
              { range: "12 - 13.99", label: "جيد", color: "bg-blue-500" },
              { range: "10 - 11.99", label: "مقبول", color: "bg-amber-500" },
              { range: "0 - 9.99", label: "ضعيف", color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-muted-foreground font-mono text-xs" dir="ltr">{item.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
