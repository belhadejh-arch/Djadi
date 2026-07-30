/**
 * Cascading selector: Level → Branch (filtered by level) → Subject (filtered by grade + branch)
 * Used across all admin content forms.
 */
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

const FALLBACK_GRADES = [
  { code: "premiere",  nameAr: "السنة الأولى ثانوي" },
  { code: "deuxieme",  nameAr: "السنة الثانية ثانوي" },
  { code: "troisieme", nameAr: "السنة الثالثة ثانوي" },
];

interface Props {
  grade: string;
  branchId: number | null;
  subjectId: number | null;
  onGradeChange: (grade: string) => void;
  onBranchIdChange: (id: number | null) => void;
  onSubjectIdChange: (id: number | null) => void;
  subjectRequired?: boolean;
  branchRequired?: boolean;
}

export function LevelBranchSubjectSelector({
  grade, branchId, subjectId,
  onGradeChange, onBranchIdChange, onSubjectIdChange,
  subjectRequired = false,
  branchRequired = false,
}: Props) {
  const { data: levels = [] }   = useQuery({ queryKey: ["admin", "levels"],   queryFn: adminApi.levels.list });
  const { data: branches = [] } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const { data: subjects = [] } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });

  const gradeOptions = levels.length > 0 ? levels : FALLBACK_GRADES;

  // Find the DB-level whose code matches the selected grade
  const selectedLevel = (levels as any[]).find((l) => l.code === grade);

  // Branches that belong to the selected level — supports multi-level (levelIds array)
  const filteredBranches = selectedLevel
    ? (branches as any[]).filter((b) => {
        const ids: number[] = Array.isArray(b.levelIds) && b.levelIds.length > 0
          ? b.levelIds
          : [b.levelId];
        return ids.includes(selectedLevel.id);
      })
    : [];

  // Subjects that match the grade and optionally the branch
  const filteredSubjects = (subjects as any[]).filter((s) => {
    if (s.grade !== grade) return false;
    if (branchId === null) return true;
    return s.branchId === null || s.branchId === branchId;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Level */}
      <div className="space-y-1">
        <Label>المستوى <span className="text-destructive">*</span></Label>
        <Select
          value={grade || ""}
          onValueChange={(v) => {
            onGradeChange(v);
            onBranchIdChange(null);
            onSubjectIdChange(null);
          }}
        >
          <SelectTrigger><SelectValue placeholder="اختر المستوى..." /></SelectTrigger>
          <SelectContent>
            {(gradeOptions as any[]).map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Branch */}
      <div className="space-y-1">
        <Label>الشعبة {branchRequired ? <span className="text-destructive">*</span> : "(اختياري)"}</Label>
        <Select
          value={branchId ? String(branchId) : (branchRequired ? "" : "all")}
          onValueChange={(v) => {
            onBranchIdChange(v === "all" ? null : Number(v));
            onSubjectIdChange(null);
          }}
          disabled={!grade}
        >
          <SelectTrigger><SelectValue placeholder="اختر الشعبة..." /></SelectTrigger>
          <SelectContent>
            {!branchRequired && <SelectItem value="all">جميع الشعب</SelectItem>}
            {filteredBranches.map((b: any) => (
              <SelectItem key={b.id} value={String(b.id)}>{b.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-1">
        <Label>المادة {subjectRequired ? <span className="text-destructive">*</span> : "(اختياري)"}</Label>
        <Select
          value={subjectId ? String(subjectId) : "none"}
          onValueChange={(v) => onSubjectIdChange(v === "none" ? null : Number(v))}
          disabled={!grade}
        >
          <SelectTrigger><SelectValue placeholder="اختر المادة..." /></SelectTrigger>
          <SelectContent>
            {!subjectRequired && <SelectItem value="none">—</SelectItem>}
            {filteredSubjects.map((s: any) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
