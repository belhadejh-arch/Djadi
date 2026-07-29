import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const empty = { nameAr: "", nameFr: "", code: "", levelId: 0, sortOrder: 0 };

export default function AdminBranches() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const { data: levels } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "branches"] });

  const create = useMutation({ mutationFn: adminApi.branches.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.branches.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.branches.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

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
      <h1 className="text-xl font-bold">إدارة الشعب</h1>
      <CrudTable
        title="الشعب الدراسية"
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
          { header: "المستوى", cell: (r) => r.levelNameAr ?? r.levelId },
          { header: "الترتيب", cell: (r) => r.sortOrder },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل الشعبة" : "إضافة شعبة"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="space-y-1"><Label>الاسم بالعربية</Label><Input value={form.nameAr} onChange={f("nameAr")} placeholder="علوم تجريبية" /></div>
          <div className="space-y-1"><Label>الاسم بالفرنسية</Label><Input value={form.nameFr} onChange={f("nameFr")} placeholder="Sciences Expérimentales" /></div>
          <div className="space-y-1"><Label>الكود</Label><Input value={form.code} onChange={f("code")} placeholder="sciences" /></div>
          <div className="space-y-1">
            <Label>المستوى</Label>
            <Select value={String(form.levelId)} onValueChange={(v) => setForm(p => ({ ...p, levelId: Number(v) }))}>
              <SelectTrigger><SelectValue placeholder="اختر مستوى..." /></SelectTrigger>
              <SelectContent>
                {levels?.map((l: any) => <SelectItem key={l.id} value={String(l.id)}>{l.nameAr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>الترتيب</Label><Input type="number" value={form.sortOrder} onChange={f("sortOrder")} /></div>
        </div>
      </FormDialog>
    </div>
  );
}
