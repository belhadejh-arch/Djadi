import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FALLBACK_LEVELS = [
  { id: 0, code: "premiere", nameAr: "السنة الأولى ثانوي", nameFr: "1ère Secondaire" },
  { id: 0, code: "deuxieme", nameAr: "السنة الثانية ثانوي", nameFr: "2ème Secondaire" },
  { id: 0, code: "troisieme", nameAr: "السنة الثالثة ثانوي", nameFr: "3ème Secondaire" },
];

function emptyForm(grade: string, branchId: number | null) {
  return { name: "", nameAr: "", nameFr: "", grade, branchId, color: "#6366f1", icon: "📚", description: "" };
}

export default function AdminSubjects() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm("premiere", null));

  // Drill-down state
  const [selectedLevelCode, setSelectedLevelCode] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const { data: levels = [], isLoading: levelsLoading } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  const { data: branches = [] } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "subjects"] });

  const create = useMutation({ mutationFn: adminApi.subjects.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.subjects.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.subjects.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  const displayLevels = (levels as any[]).length > 0 ? levels : FALLBACK_LEVELS;

  const selectedLevel = (displayLevels as any[]).find((l) => l.code === selectedLevelCode);

  // Branches filtered by selected level (supports multi-level levelIds)
  const filteredBranches = selectedLevel
    ? (branches as any[]).filter((b) => {
        const ids: number[] = Array.isArray(b.levelIds) && b.levelIds.length > 0
          ? b.levelIds
          : [b.levelId];
        return ids.includes(selectedLevel.id);
      })
    : [];

  // Subjects for the selected level + branch
  const filteredSubjects = (subjects as any[]).filter((s) => {
    if (s.grade !== selectedLevelCode) return false;
    if (selectedBranchId === null) return true;
    return s.branchId === null || s.branchId === selectedBranchId;
  });

  function open(row?: any) {
    if (row) {
      setEditing(row);
      setForm({ name: row.name, nameAr: row.nameAr, nameFr: row.nameFr, grade: row.grade, branchId: row.branchId, color: row.color, icon: row.icon, description: row.description ?? "" });
    } else {
      setEditing(null);
      setForm(emptyForm(selectedLevelCode ?? "premiere", selectedBranchId));
    }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }
  function submit() {
    const body = { ...form, branchId: form.branchId || null };
    if (editing) update.mutate({ id: editing.id, body });
    else create.mutate(body);
  }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  // ── View: no level selected → show level cards ──────────────────────────────
  if (!selectedLevelCode) {
    return (
      <div className="space-y-4" dir="rtl">
        <h1 className="text-xl font-bold">إدارة المواد</h1>
        <p className="text-sm text-muted-foreground">اختر المستوى الدراسي</p>
        {levelsLoading ? (
          <p className="text-muted-foreground">جاري التحميل...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(displayLevels as any[]).map((l) => {
              const count = (subjects as any[]).filter((s) => s.grade === l.code).length;
              return (
                <Card
                  key={l.code}
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  onClick={() => setSelectedLevelCode(l.code)}
                >
                  <CardContent className="p-5 text-center space-y-1">
                    <p className="text-lg font-bold">{l.nameAr}</p>
                    <p className="text-sm text-muted-foreground">{l.nameFr}</p>
                    <p className="text-xs text-muted-foreground mt-2">{count} مادة</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── View: level selected, no branch → show branch cards ─────────────────────
  if (!selectedBranchId) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedLevelCode(null)} className="gap-1 px-2">
            <ChevronRight className="h-4 w-4" />
            المواد
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold">{selectedLevel?.nameAr}</span>
        </div>

        <p className="text-sm text-muted-foreground">اختر الشعبة</p>

        {filteredBranches.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد شعب مرتبطة بهذا المستوى بعد</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredBranches.map((b: any) => {
              const count = (subjects as any[]).filter(
                (s) => s.grade === selectedLevelCode && (s.branchId === null || s.branchId === b.id)
              ).length;
              return (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  onClick={() => setSelectedBranchId(b.id)}
                >
                  <CardContent className="p-5 text-center space-y-1">
                    <p className="text-lg font-bold">{b.nameAr}</p>
                    <p className="text-sm text-muted-foreground">{b.nameFr}</p>
                    <p className="text-xs text-muted-foreground mt-2">{count} مادة</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── View: level + branch selected → subjects list ────────────────────────────
  const selectedBranch = (branches as any[]).find((b) => b.id === selectedBranchId);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedLevelCode(null); setSelectedBranchId(null); }} className="gap-1 px-2">
          <ChevronRight className="h-4 w-4" />
          المواد
        </Button>
        <span className="text-muted-foreground">/</span>
        <Button variant="ghost" size="sm" onClick={() => setSelectedBranchId(null)} className="px-2">
          {selectedLevel?.nameAr}
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-semibold">{selectedBranch?.nameAr}</span>
      </div>

      <CrudTable
        title={`مواد ${selectedBranch?.nameAr} — ${selectedLevel?.nameAr}`}
        data={filteredSubjects}
        isLoading={subjectsLoading}
        searchable
        searchPlaceholder="بحث عن مادة..."
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "الأيقونة", cell: (r) => <span className="text-xl">{r.icon}</span>, className: "w-12" },
          { header: "الاسم (عربي)", cell: (r) => <span className="font-medium">{r.nameAr}</span> },
          { header: "الاسم (فرنسي)", cell: (r) => r.nameFr },
          { header: "اللون", cell: (r) => <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full border" style={{ background: r.color }} />{r.color}</span> },
          { header: "الدروس", cell: (r) => r.lessonCount },
        ]}
      />

      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل المادة" : "إضافة مادة"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>الاسم بالعربية <span className="text-destructive">*</span></Label>
            <Input value={form.nameAr} onChange={f("nameAr")} />
          </div>
          <div className="space-y-1">
            <Label>الاسم بالفرنسية <span className="text-destructive">*</span></Label>
            <Input value={form.nameFr} onChange={f("nameFr")} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>الاسم الافتراضي <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={f("name")} />
          </div>
          <div className="space-y-1">
            <Label>المستوى <span className="text-destructive">*</span></Label>
            <Select value={form.grade} onValueChange={(v) => setForm(p => ({ ...p, grade: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(displayLevels as any[]).map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>الشعبة</Label>
            <Select
              value={form.branchId ? String(form.branchId) : "none"}
              onValueChange={(v) => setForm(p => ({ ...p, branchId: v === "none" ? null : Number(v) }))}
            >
              <SelectTrigger><SelectValue placeholder="كل الشعب" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">كل الشعب</SelectItem>
                {(branches as any[]).map((b: any) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>اللون <span className="text-destructive">*</span></Label>
            <Input type="color" value={form.color} onChange={f("color")} className="h-9 px-1 cursor-pointer" />
          </div>
          <div className="space-y-1">
            <Label>الأيقونة (emoji) <span className="text-destructive">*</span></Label>
            <Input value={form.icon} onChange={f("icon")} placeholder="📚" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>الوصف (اختياري)</Label>
            <Input value={form.description} onChange={f("description")} />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
