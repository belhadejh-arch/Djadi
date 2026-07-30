import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { LevelBranchSubjectSelector } from "@/components/admin/level-branch-subject-selector";
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
  title: "", titleAr: "",
  grade: "premiere",
  branchId: null as number | null,
  subjectId: null as number | null,
  semester: "1",
  link: "",
};

export default function AdminTests() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "tests"], queryFn: adminApi.tests.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "tests"] });

  const create = useMutation({ mutationFn: adminApi.tests.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.tests.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del    = useMutation({ mutationFn: adminApi.tests.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row, branchId: null }); }
    else     { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    const { branchId: _b, ...rest } = form;
    const body = { ...rest, subjectId: form.subjectId || null };
    if (editing) update.mutate({ id: editing.id, body });
    else         create.mutate(body);
  }

  const f = (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const semLabel = (v: string) => SEMESTERS.find((s) => s.value === v)?.label ?? v;

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة الاختبارات</h1>

      <CrudTable
        title="الاختبارات"
        data={data}
        isLoading={isLoading}
        searchable
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "العنوان",  cell: (r) => <span className="font-medium">{r.titleAr}</span> },
          { header: "المستوى", cell: (r) => r.grade },
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
        title={editing ? "تعديل الاختبار" : "إضافة اختبار"}
        onSubmit={submit}
        isSubmitting={create.isPending || update.isPending}
      >
        <div className="space-y-3">
          {/* Titles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>العنوان (عربي)</Label><Input value={form.titleAr} onChange={f("titleAr")} /></div>
            <div className="space-y-1"><Label>العنوان (فرنسي)</Label><Input value={form.title} onChange={f("title")} /></div>
          </div>

          {/* Cascade */}
          <LevelBranchSubjectSelector
            grade={form.grade}
            branchId={form.branchId}
            subjectId={form.subjectId}
            onGradeChange={(v)    => setForm((p) => ({ ...p, grade: v, branchId: null, subjectId: null }))}
            onBranchIdChange={(v) => setForm((p) => ({ ...p, branchId: v, subjectId: null }))}
            onSubjectIdChange={(v) => setForm((p) => ({ ...p, subjectId: v }))}
          />

          {/* Semester */}
          <div className="space-y-1">
            <Label>الفصل الدراسي</Label>
            <Select value={form.semester} onValueChange={(v) => setForm((p) => ({ ...p, semester: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* PDF link */}
          <div className="space-y-1">
            <Label>رابط PDF</Label>
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
