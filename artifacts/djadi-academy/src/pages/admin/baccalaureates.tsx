import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PdfViewer } from "@/components/pdf-viewer";
import { useToast } from "@/hooks/use-toast";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2009 }, (_, i) => CURRENT_YEAR - i);

// Baccalaureate is always السنة الثالثة ثانوي (troisieme)
const BAC_GRADE = "troisieme";

const empty = {
  year: CURRENT_YEAR,
  title: "",
  branchId: null as number | null,   // UI-only for cascade filtering
  subjectId: null as number | null,
  link: "",
};

export default function AdminBaccalaureates() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "baccalaureates"], queryFn: adminApi.baccalaureates.list });
  const { data: levels = [] } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  const { data: branches = [] } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const { data: subjects = [] } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "baccalaureates"] });
    // Also invalidate the student-facing list so changes appear immediately
    qc.invalidateQueries({ queryKey: ["baccalaureates"] });
  };

  const create = useMutation({ mutationFn: adminApi.baccalaureates.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.baccalaureates.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del    = useMutation({ mutationFn: adminApi.baccalaureates.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  // The troisieme level record
  const triLevel = (levels as any[]).find((l) => l.code === BAC_GRADE);

  // Branches for السنة الثالثة ثانوي
  const triBranches = triLevel
    ? (branches as any[]).filter((b) => {
        const ids: number[] = Array.isArray(b.levelIds) && b.levelIds.length > 0
          ? b.levelIds : [b.levelId];
        return ids.includes(triLevel.id);
      })
    : (branches as any[]).filter((b) => b.levelId && b.levelId > 0); // fallback: show all

  // Subjects for the selected branch (grade = troisieme)
  const filteredSubjects = (subjects as any[]).filter((s) => {
    if (s.grade !== BAC_GRADE) return false;
    if (!form.branchId) return true;
    return s.branchId === null || s.branchId === form.branchId;
  });

  function open(row?: any) {
    if (row) {
      setEditing(row);
      setForm({
        year: row.year ?? CURRENT_YEAR,
        title: row.title ?? "",
        branchId: null,
        subjectId: row.subjectId ?? null,
        link: row.link ?? "",
      });
    } else {
      setEditing(null);
      setForm(empty);
    }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    if (!form.title.trim())  { toast({ title: "يجب إدخال عنوان الملف", variant: "destructive" }); return; }
    if (!form.branchId)      { toast({ title: "يجب اختيار الشعبة", variant: "destructive" }); return; }
    if (!form.subjectId)     { toast({ title: "يجب اختيار المادة", variant: "destructive" }); return; }
    if (!form.link.trim())   { toast({ title: "يجب إدخال رابط PDF", variant: "destructive" }); return; }

    const { branchId: _b, ...rest } = form;
    const body = { ...rest, grade: BAC_GRADE, subject: "", subjectAr: "", branchId: form.branchId };
    if (editing) update.mutate({ id: editing.id, body });
    else         create.mutate(body);
  }

  // Helper: find subject name by id
  const subjectName = (id: number | null) =>
    id ? (subjects as any[]).find((s) => s.id === id)?.nameAr ?? `#${id}` : "—";

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة امتحانات البكالوريا السابقة</h1>

      <CrudTable
        title="بكالوريات سابقة"
        data={data}
        isLoading={isLoading}
        searchable
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "السنة",    cell: (r) => <span className="font-bold text-primary">{r.year}</span> },
          { header: "العنوان",  cell: (r) => r.title ?? r.subjectAr },
          { header: "المادة",   cell: (r) => r.subjectId ? subjectName(r.subjectId) : r.subjectAr },
          { header: "عرض PDF", cell: (r) => r.link ? (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPdfPreview({ url: r.link, title: `بكالوريا ${r.year} — ${r.title ?? r.subjectAr}` })}>
              <Eye className="h-3.5 w-3.5" />عرض
            </Button>
          ) : null },
        ]}
      />

      <FormDialog
        open={dialogOpen}
        onClose={close}
        title={editing ? "تعديل الموضوع" : "إضافة موضوع بكالوريا"}
        onSubmit={submit}
        isSubmitting={create.isPending || update.isPending}
      >
        <div className="space-y-4">
          {/* 1. Year — card grid */}
          <div className="space-y-2">
            <Label>السنة <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, year: y }))}
                  className={`rounded-lg border py-2 text-sm font-semibold transition-colors
                    ${form.year === y
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted hover:bg-muted/70 border-transparent text-foreground"
                    }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Level — fixed, display only */}
          <div className="space-y-1">
            <Label>المستوى</Label>
            <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/50">
              <Badge variant="secondary">السنة الثالثة ثانوي</Badge>
              <span className="text-xs text-muted-foreground">(ثابت لجميع مواضيع البكالوريا)</span>
            </div>
          </div>

          {/* 3. Branch */}
          <div className="space-y-1">
            <Label>الشعبة <span className="text-destructive">*</span></Label>
            <Select
              value={form.branchId ? String(form.branchId) : ""}
              onValueChange={(v) => setForm((p) => ({ ...p, branchId: Number(v), subjectId: null }))}
            >
              <SelectTrigger><SelectValue placeholder="اختر الشعبة..." /></SelectTrigger>
              <SelectContent>
                {triBranches.map((b: any) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Subject — filtered by branch */}
          <div className="space-y-1">
            <Label>المادة <span className="text-destructive">*</span></Label>
            <Select
              value={form.subjectId ? String(form.subjectId) : ""}
              onValueChange={(v) => setForm((p) => ({ ...p, subjectId: Number(v) }))}
              disabled={!form.branchId}
            >
              <SelectTrigger><SelectValue placeholder={form.branchId ? "اختر المادة..." : "اختر الشعبة أولاً"} /></SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 5. File title */}
          <div className="space-y-1">
            <Label>عنوان الملف <span className="text-destructive">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="مثال: موضوع بكالوريا 2024 — الرياضيات"
            />
          </div>

          {/* 6. PDF link */}
          <div className="space-y-1">
            <Label>رابط ملف PDF <span className="text-destructive">*</span></Label>
            <Input
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
      </FormDialog>

      {pdfPreview && (
        <PdfViewer url={pdfPreview.url} title={pdfPreview.title} onClose={() => setPdfPreview(null)} />
      )}
    </div>
  );
}
