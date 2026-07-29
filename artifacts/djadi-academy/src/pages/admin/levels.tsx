import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const empty = { nameAr: "", nameFr: "", code: "", sortOrder: 0 };

export default function AdminLevels() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "levels"] });

  const create = useMutation({ mutationFn: adminApi.levels.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.levels.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.levels.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row }); }
    else { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }
  function submit() {
    if (editing) update.mutate({ id: editing.id, body: form });
    else create.mutate(form);
  }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: k === "sortOrder" ? Number(e.target.value) : e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة المستويات</h1>
      <CrudTable
        title="المستويات الدراسية"
        data={data}
        isLoading={isLoading}
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "الاسم (عربي)", cell: (r) => <span className="font-medium">{r.nameAr}</span> },
          { header: "الاسم (فرنسي)", cell: (r) => r.nameFr },
          { header: "الكود", cell: (r) => <code className="text-xs bg-muted px-1 py-0.5 rounded">{r.code}</code> },
          { header: "الترتيب", cell: (r) => r.sortOrder },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل المستوى" : "إضافة مستوى"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="space-y-1"><Label>الاسم بالعربية</Label><Input value={form.nameAr} onChange={f("nameAr")} placeholder="السنة الأولى ثانوي" /></div>
          <div className="space-y-1"><Label>الاسم بالفرنسية</Label><Input value={form.nameFr} onChange={f("nameFr")} placeholder="1ère Secondaire" /></div>
          <div className="space-y-1"><Label>الكود</Label><Input value={form.code} onChange={f("code")} placeholder="premiere" /></div>
          <div className="space-y-1"><Label>الترتيب</Label><Input type="number" value={form.sortOrder} onChange={f("sortOrder")} /></div>
        </div>
      </FormDialog>
    </div>
  );
}
