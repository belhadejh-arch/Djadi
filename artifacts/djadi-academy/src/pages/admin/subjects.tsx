import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const GRADES = ["premiere", "deuxieme", "troisieme"];
const empty = { name: "", nameAr: "", nameFr: "", grade: "premiere", branchId: null as number | null, color: "#6366f1", icon: "📚", description: "", lessonCount: 0 };

export default function AdminSubjects() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const { data: branches } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "subjects"] });

  const create = useMutation({ mutationFn: adminApi.subjects.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.subjects.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.subjects.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row }); }
    else { setEditing(null); setForm(empty); }
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

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة المواد</h1>
      <CrudTable
        title="المواد الدراسية"
        data={data}
        isLoading={isLoading}
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
          { header: "المستوى", cell: (r) => r.grade },
          { header: "اللون", cell: (r) => <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full border" style={{ background: r.color }} />{r.color}</span> },
          { header: "الدروس", cell: (r) => r.lessonCount },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل المادة" : "إضافة مادة"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>الاسم بالعربية</Label><Input value={form.nameAr} onChange={f("nameAr")} /></div>
          <div className="space-y-1"><Label>الاسم بالفرنسية</Label><Input value={form.nameFr} onChange={f("nameFr")} /></div>
          <div className="col-span-2 space-y-1"><Label>الاسم (افتراضي)</Label><Input value={form.name} onChange={f("name")} /></div>
          <div className="space-y-1">
            <Label>المستوى</Label>
            <Select value={form.grade} onValueChange={(v) => setForm(p => ({ ...p, grade: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>الشعبة (اختياري)</Label>
            <Select value={form.branchId ? String(form.branchId) : "none"} onValueChange={(v) => setForm(p => ({ ...p, branchId: v === "none" ? null : Number(v) }))}>
              <SelectTrigger><SelectValue placeholder="كل الشعب" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">كل الشعب</SelectItem>
                {branches?.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.nameAr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>اللون</Label><Input type="color" value={form.color} onChange={f("color")} className="h-9 px-1 cursor-pointer" /></div>
          <div className="space-y-1"><Label>الأيقونة (emoji)</Label><Input value={form.icon} onChange={f("icon")} placeholder="📚" /></div>
          <div className="col-span-2 space-y-1"><Label>الوصف (اختياري)</Label><Input value={form.description} onChange={f("description")} /></div>
        </div>
      </FormDialog>
    </div>
  );
}
