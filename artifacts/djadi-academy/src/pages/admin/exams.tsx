import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
// Student content queries share the ["content"] prefix (subject-detail.tsx)
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { LevelBranchSubjectSelector, useLevelNameMap } from "@/components/admin/level-branch-subject-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/components/pdf-viewer";
import { useToast } from "@/hooks/use-toast";

const SEMESTERS = [
  { value: "1", label: "الفصل الأول" },
  { value: "2", label: "الفصل الثاني" },
  { value: "3", label: "الفصل الثالث" },
];

const empty = {
  titleAr: "",
  title: "",
  grade: "premiere",
  branchId: null as number | null,
  subjectId: null as number | null,
  semester: "1",
  link: "",
};

export default function AdminExams() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);
  const levelNames = useLevelNameMap();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "exams"], queryFn: adminApi.exams.list });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "exams"] });
    // Also invalidate student-facing content so changes appear immediately
    qc.invalidateQueries({ queryKey: ["content"] });
  };

  const create = useMutation({ mutationFn: adminApi.exams.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.exams.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del    = useMutation({ mutationFn: adminApi.exams.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row, branchId: null }); }
    else     { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    if (!form.titleAr.trim()) { toast({ title: "يجب إدخال عنوان الفرض", variant: "destructive" }); return; }
    if (!form.grade)          { toast({ title: "يجب اختيار المستوى", variant: "destructive" }); return; }
    if (!form.branchId)       { toast({ title: "يجب اختيار الشعبة", variant: "destructive" }); return; }
    if (!form.subjectId)      { toast({ title: "يجب اختيار المادة", variant: "destructive" }); return; }
    if (!form.link.trim())    { toast({ title: "يجب إدخال رابط PDF", variant: "destructive" }); return; }

    const { branchId: _b, ...rest } = form;
    const body = { ...rest, title: form.title || form.titleAr, subjectId: form.subjectId };
    if (editing) update.mutate({ id: editing.id, body });
    else         create.mutate(body);
  }

  const f = (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const semLabel = (v: string) => SEMESTERS.find((s) => s.value === v)?.label ?? v;

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة الفروض</h1>

      <CrudTable
        title="الفروض"
        data={data}
        isLoading={isLoading}
        searchable
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "العنوان",  cell: (r) => <span className="font-medium">{r.titleAr}</span> },
          { header: "المستوى", cell: (r) => levelNames[r.grade] ?? r.grade },
          { header: "الفصل",   cell: (r) => semLabel(r.semester ?? "1") },
          { header: "عرض PDF", cell: (r) => r.link ? (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPdfPreview({ url: r.link, title: r.titleAr })}>
              <Eye className="h-3.5 w-3.5" />عرض
            </Button>
          ) : null },
        ]}
      />

      <FormDialog
        open={dialogOpen}
        onClose={close}
        title={editing ? "تعديل الفرض" : "إضافة فرض"}
        onSubmit={submit}
        isSubmitting={create.isPending || update.isPending}
      >
        <div className="space-y-3">
          {/* 1. Title */}
          <div className="space-y-1">
            <Label>عنوان الفرض <span className="text-destructive">*</span></Label>
            <Input value={form.titleAr} onChange={f("titleAr")} placeholder="اكتب عنوان الفرض..." />
          </div>

          {/* 2-4. Cascade: level → branch (required) → subject (required) */}
          <LevelBranchSubjectSelector
            grade={form.grade}
            branchId={form.branchId}
            subjectId={form.subjectId}
            onGradeChange={(v)    => setForm((p) => ({ ...p, grade: v, branchId: null, subjectId: null }))}
            onBranchIdChange={(v) => setForm((p) => ({ ...p, branchId: v, subjectId: null }))}
            onSubjectIdChange={(v) => setForm((p) => ({ ...p, subjectId: v }))}
            branchRequired
            subjectRequired
          />

          {/* 5. Semester */}
          <div className="space-y-1">
            <Label>الفصل الدراسي <span className="text-destructive">*</span></Label>
            <Select value={form.semester} onValueChange={(v) => setForm((p) => ({ ...p, semester: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 6. PDF link */}
          <div className="space-y-1">
            <Label>رابط ملف PDF <span className="text-destructive">*</span></Label>
            <Input value={form.link} onChange={f("link")} placeholder="https://..." />
          </div>
        </div>
      </FormDialog>

      {pdfPreview && (
        <PdfViewer url={pdfPreview.url} title={pdfPreview.title} onClose={() => setPdfPreview(null)} />
      )}
    </div>
  );
}
