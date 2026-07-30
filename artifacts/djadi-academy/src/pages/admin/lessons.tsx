import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { getListLessonsQueryKey } from "@workspace/api-client-react";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { LevelBranchSubjectSelector } from "@/components/admin/level-branch-subject-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/components/pdf-viewer";
import { useToast } from "@/hooks/use-toast";

const TYPES = [
  { value: "pdf",   label: "PDF" },
  { value: "video", label: "فيديو" },
  { value: "link",  label: "رابط" },
];
const typeColors: Record<string, string> = {
  pdf:   "bg-red-100 text-red-700",
  video: "bg-blue-100 text-blue-700",
  link:  "bg-green-100 text-green-700",
};

const empty = {
  titleAr: "",
  title: "",
  grade: "premiere",
  branchId: null as number | null,
  subjectId: 0,
  type: "pdf" as "pdf" | "video" | "link",
  pdfUrl: "",
  videoUrl: "",
  linkUrl: "",
  duration: 30,
  description: "",
};

export default function AdminLessons() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "lessons"],
    queryFn: () => adminApi.lessons.list(),
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "lessons"] });
    // Also invalidate student-facing lessons so changes appear immediately
    qc.invalidateQueries({ queryKey: getListLessonsQueryKey() });
  };

  const create = useMutation({ mutationFn: adminApi.lessons.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.lessons.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del    = useMutation({ mutationFn: adminApi.lessons.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row, branchId: null }); }
    else     { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    if (!form.grade) { toast({ title: "يجب اختيار المستوى", variant: "destructive" }); return; }
    if (!form.branchId) { toast({ title: "يجب اختيار الشعبة", variant: "destructive" }); return; }
    if (!form.subjectId) { toast({ title: "يجب اختيار المادة", variant: "destructive" }); return; }
    if (!form.titleAr.trim()) { toast({ title: "يجب إدخال عنوان الدرس", variant: "destructive" }); return; }
    const url = form.type === "pdf" ? form.pdfUrl : form.type === "video" ? form.videoUrl : form.linkUrl;
    if (!url.trim()) { toast({ title: "يجب إدخال الرابط", variant: "destructive" }); return; }

    const { branchId: _b, ...rest } = form;
    const body = {
      ...rest,
      title: form.title || form.titleAr,
      subjectId: Number(form.subjectId),
      duration:  Number(form.duration),
      pdfUrl:    form.pdfUrl   || null,
      videoUrl:  form.videoUrl || null,
      linkUrl:   form.linkUrl  || null,
    };
    if (editing) update.mutate({ id: editing.id, body });
    else         create.mutate(body);
  }

  const f = (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة الدروس</h1>

      <CrudTable
        title="الدروس"
        data={data}
        isLoading={isLoading}
        searchable
        searchPlaceholder="بحث عن درس..."
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "العنوان",  cell: (r) => <span className="font-medium">{r.titleAr}</span> },
          { header: "المادة",   cell: (r) => r.subjectName ?? r.subjectId },
          { header: "المستوى", cell: (r) => r.grade },
          { header: "النوع",   cell: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[r.type] ?? ""}`}>{r.type.toUpperCase()}</span> },
          { header: "عرض PDF", cell: (r) => r.pdfUrl ? (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPdfPreview({ url: r.pdfUrl, title: r.titleAr })}>
              <Eye className="h-3.5 w-3.5" />عرض
            </Button>
          ) : null },
        ]}
      />

      <FormDialog
        open={dialogOpen}
        onClose={close}
        title={editing ? "تعديل الدرس" : "إضافة درس"}
        onSubmit={submit}
        isSubmitting={create.isPending || update.isPending}
      >
        <div className="space-y-3">
          {/* 1. Cascade: level (required) → branch (required) → subject (required) */}
          <LevelBranchSubjectSelector
            grade={form.grade}
            branchId={form.branchId}
            subjectId={form.subjectId || null}
            onGradeChange={(v)    => setForm((p) => ({ ...p, grade: v, branchId: null, subjectId: 0 }))}
            onBranchIdChange={(v) => setForm((p) => ({ ...p, branchId: v, subjectId: 0 }))}
            onSubjectIdChange={(v) => setForm((p) => ({ ...p, subjectId: v ?? 0 }))}
            branchRequired
            subjectRequired
          />

          {/* 2. Lesson title */}
          <div className="space-y-1">
            <Label>عنوان الدرس <span className="text-destructive">*</span></Label>
            <Input value={form.titleAr} onChange={f("titleAr")} placeholder="اكتب عنوان الدرس..." />
          </div>

          {/* 3. Content type */}
          <div className="space-y-1">
            <Label>نوع المحتوى <span className="text-destructive">*</span></Label>
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as any, pdfUrl: "", videoUrl: "", linkUrl: "" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* 4. URL (conditional on type) */}
          {form.type === "pdf"   && <div className="space-y-1"><Label>رابط PDF <span className="text-destructive">*</span></Label><Input value={form.pdfUrl}   onChange={f("pdfUrl")}   placeholder="https://..." /></div>}
          {form.type === "video" && <div className="space-y-1"><Label>رابط الفيديو <span className="text-destructive">*</span></Label><Input value={form.videoUrl} onChange={f("videoUrl")} placeholder="https://..." /></div>}
          {form.type === "link"  && <div className="space-y-1"><Label>الرابط <span className="text-destructive">*</span></Label><Input value={form.linkUrl}  onChange={f("linkUrl")}  placeholder="https://..." /></div>}
        </div>
      </FormDialog>

      {pdfPreview && (
        <PdfViewer
          url={pdfPreview.url}
          title={pdfPreview.title}
          onClose={() => setPdfPreview(null)}
        />
      )}
    </div>
  );
}
