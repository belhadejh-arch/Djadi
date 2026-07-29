import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const GRADES = ["premiere", "deuxieme", "troisieme"];
const TYPES = [{ value: "pdf", label: "PDF" }, { value: "video", label: "فيديو" }, { value: "link", label: "رابط" }];
const empty = { title: "", titleAr: "", subjectId: 0, grade: "premiere", duration: 30, type: "pdf", description: "", pdfUrl: "", videoUrl: "", linkUrl: "" };

const typeColors: Record<string, string> = { pdf: "bg-red-100 text-red-700", video: "bg-blue-100 text-blue-700", link: "bg-green-100 text-green-700" };

export default function AdminLessons() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "lessons"], queryFn: () => adminApi.lessons.list() });
  const { data: subjects } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "lessons"] });

  const create = useMutation({ mutationFn: adminApi.lessons.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.lessons.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.lessons.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row }); }
    else { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }
  function submit() {
    const body = {
      ...form,
      subjectId: Number(form.subjectId),
      duration: Number(form.duration),
      pdfUrl: form.pdfUrl || null,
      videoUrl: form.videoUrl || null,
      linkUrl: form.linkUrl || null,
    };
    if (editing) update.mutate({ id: editing.id, body });
    else create.mutate(body);
  }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
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
          { header: "العنوان (عربي)", cell: (r) => <span className="font-medium">{r.titleAr}</span> },
          { header: "المادة", cell: (r) => r.subjectName ?? r.subjectId },
          { header: "المستوى", cell: (r) => r.grade },
          { header: "النوع", cell: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[r.type] ?? ""}`}>{r.type.toUpperCase()}</span> },
          { header: "المدة", cell: (r) => `${r.duration} د` },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل الدرس" : "إضافة درس"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>العنوان (عربي)</Label><Input value={form.titleAr} onChange={f("titleAr")} /></div>
          <div className="space-y-1"><Label>العنوان (فرنسي)</Label><Input value={form.title} onChange={f("title")} /></div>
          <div className="space-y-1">
            <Label>المادة</Label>
            <Select value={String(form.subjectId)} onValueChange={(v) => setForm(p => ({ ...p, subjectId: Number(v) }))}>
              <SelectTrigger><SelectValue placeholder="اختر مادة..." /></SelectTrigger>
              <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.nameAr}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>المستوى</Label>
            <Select value={form.grade} onValueChange={(v) => setForm(p => ({ ...p, grade: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>النوع</Label>
            <Select value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>المدة (دقائق)</Label><Input type="number" value={form.duration} onChange={f("duration")} /></div>
          <div className="col-span-2 space-y-1"><Label>الوصف (اختياري)</Label><Input value={form.description} onChange={f("description")} /></div>
          {form.type === "pdf" && <div className="col-span-2 space-y-1"><Label>رابط PDF</Label><Input value={form.pdfUrl} onChange={f("pdfUrl")} placeholder="https://..." /></div>}
          {form.type === "video" && <div className="col-span-2 space-y-1"><Label>رابط الفيديو</Label><Input value={form.videoUrl} onChange={f("videoUrl")} placeholder="https://..." /></div>}
          {form.type === "link" && <div className="col-span-2 space-y-1"><Label>الرابط</Label><Input value={form.linkUrl} onChange={f("linkUrl")} placeholder="https://..." /></div>}
        </div>
      </FormDialog>
    </div>
  );
}
