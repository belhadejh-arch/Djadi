import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";

const GRADES = ["premiere", "deuxieme", "troisieme"];
const empty = { title: "", titleAr: "", subjectId: null as number | null, grade: "premiere", link: "" };

export default function AdminTests() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "tests"], queryFn: adminApi.tests.list });
  const { data: subjects } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "tests"] });

  const create = useMutation({ mutationFn: adminApi.tests.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.tests.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.tests.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

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
          { header: "العنوان (عربي)", cell: (r) => <span className="font-medium">{r.titleAr}</span> },
          { header: "العنوان (فرنسي)", cell: (r) => r.title },
          { header: "المستوى", cell: (r) => r.grade },
          { header: "الرابط", cell: (r) => <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-xs hover:underline"><ExternalLink className="h-3 w-3" />فتح</a> },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل الاختبار" : "إضافة اختبار"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="space-y-1"><Label>العنوان (عربي)</Label><Input value={form.titleAr} onChange={f("titleAr")} /></div>
          <div className="space-y-1"><Label>العنوان (فرنسي)</Label><Input value={form.title} onChange={f("title")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>المستوى</Label>
              <Select value={form.grade} onValueChange={(v) => setForm(p => ({ ...p, grade: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
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
          </div>
          <div className="space-y-1"><Label>الرابط</Label><Input value={form.link} onChange={f("link")} placeholder="https://..." /></div>
        </div>
      </FormDialog>
    </div>
  );
}
