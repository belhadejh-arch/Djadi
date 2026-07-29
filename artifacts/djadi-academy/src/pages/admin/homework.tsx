import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const GRADES = [
  { value: "premiere", label: "السنة الأولى" },
  { value: "deuxieme", label: "السنة الثانية" },
  { value: "troisieme", label: "السنة الثالثة" },
];
const SEMESTERS = [
  { value: "1", label: "الفصل الأول" },
  { value: "2", label: "الفصل الثاني" },
  { value: "3", label: "الفصل الثالث" },
];

const empty = { title: "", titleAr: "", subjectId: null as number | null, grade: "premiere", semester: "1", link: "" };

export default function AdminHomework() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "homework"], queryFn: adminApi.homework.list });
  const { data: subjects } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "homework"] });

  const create = useMutation({ mutationFn: adminApi.homework.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.homework.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.homework.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row }); }
    else { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }
  function submit() {
    const body = { ...form, subjectId: form.subjectId || null };
    if (editing) update.mutate({ id: editing.id, body });
    else create.mutate(body);
  }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة الواجبات المنزلية</h1>
      <CrudTable
        title="الواجبات المنزلية"
        data={data}
        isLoading={isLoading}
        searchable
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "العنوان (عربي)", cell: (r) => <span className="font-medium">{r.titleAr}</span> },
          { header: "المستوى", cell: (r) => GRADES.find(g => g.value === r.grade)?.label ?? r.grade },
          { header: "الفصل", cell: (r) => SEMESTERS.find(s => s.value === r.semester)?.label ?? r.semester },
          { header: "الرابط", cell: (r) => (
            <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline truncate max-w-[200px] block">
              {r.link}
            </a>
          )},
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل الواجب" : "إضافة واجب منزلي"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="space-y-1"><Label>العنوان (عربي)</Label><Input value={form.titleAr} onChange={f("titleAr")} /></div>
          <div className="space-y-1"><Label>العنوان (فرنسي)</Label><Input value={form.title} onChange={f("title")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>المستوى</Label>
              <Select value={form.grade} onValueChange={(v) => setForm(p => ({ ...p, grade: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>الفصل الدراسي</Label>
              <Select value={form.semester} onValueChange={(v) => setForm(p => ({ ...p, semester: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEMESTERS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>المادة (اختياري)</Label>
            <Select value={form.subjectId ? String(form.subjectId) : "none"} onValueChange={(v) => setForm(p => ({ ...p, subjectId: v === "none" ? null : Number(v) }))}>
              <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {subjects?.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.nameAr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>رابط PDF</Label><Input value={form.link} onChange={f("link")} placeholder="https://..." /></div>
        </div>
      </FormDialog>
    </div>
  );
}
