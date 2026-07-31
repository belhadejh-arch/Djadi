/**
 * Cascading selector: Level → Branch (filtered by level) → Subject (filtered by grade + branch)
 * Used across all admin content forms.
 *
 * Single source of truth: all options come from the shared catalog tables via the API.
 * There are NO hardcoded fallback lists — if the catalog fails to load, an explicit
 * error is shown instead of silently substituting stale data.
 */
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

/** Map level code → Arabic name, built from the live catalog (for table displays). */
export function useLevelNameMap(): Record<string, string> {
  const { data: levels = [] } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  return Object.fromEntries((levels as any[]).map((l) => [l.code, l.nameAr]));
}

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
  const levelsQ   = useQuery({ queryKey: ["admin", "levels"],   queryFn: adminApi.levels.list });
  const branchesQ = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const subjectsQ = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });

  const levels   = (levelsQ.data   ?? []) as any[];
  const branches = (branchesQ.data ?? []) as any[];
  const subjects = (subjectsQ.data ?? []) as any[];

  const isLoading = levelsQ.isLoading || branchesQ.isLoading || subjectsQ.isLoading;
  const isError   = levelsQ.isError || branchesQ.isError || subjectsQ.isError;

  // Find the DB-level whose code matches the selected grade
  const selectedLevel = levels.find((l) => l.code === grade);

  // Branches that belong to the selected level — supports multi-level (levelIds array)
  const filteredBranches = selectedLevel
    ? branches.filter((b) => {
        const ids: number[] = Array.isArray(b.levelIds) && b.levelIds.length > 0
          ? b.levelIds
          : [b.levelId];
        return ids.includes(selectedLevel.id);
      })
    : [];

  // Subjects that match the grade and optionally the branch
  const filteredSubjects = subjects.filter((s) => {
    if (s.grade !== grade) return false;
    if (branchId === null) return true;
    return s.branchId === null || s.branchId === branchId;
  });

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        تعذر تحميل المستويات والشعب والمواد من قاعدة البيانات. أعد المحاولة لاحقاً.
      </p>
    );
  }

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
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر المستوى..."} />
          </SelectTrigger>
          <SelectContent>
            {levels.map((l) => (
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
          disabled={isLoading || !grade}
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
          disabled={isLoading || !grade}
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
