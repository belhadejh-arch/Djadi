import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const empty = { title: "", titleAr: "", content: "", contentAr: "", isActive: true, startsAt: "", endsAt: "" };

export default function AdminAnnouncements() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "announcements"], queryFn: adminApi.announcements.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "announcements"] });

  const create = useMutation({ mutationFn: adminApi.announcements.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.announcements.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.announcements.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) {
      setEditing(row);
      setForm({
        ...empty, ...row,
        startsAt: row.startsAt ? new Date(row.startsAt).toISOString().slice(0, 16) : "",
        endsAt: row.endsAt ? new Date(row.endsAt).toISOString().slice(0, 16) : "",
      });
    } else { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }
  function submit() {
    const body = {
      ...form,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };
    if (editing) update.mutate({ id: editing.id, body });
    else create.mutate(body);
  }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة الإعلانات</h1>
      <CrudTable
        title="الإعلانات"
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
          { header: "الحالة", cell: (r) => <Badge variant={r.isActive ? "outline" : "secondary"} className={r.isActive ? "border-green-500 text-green-600" : ""}>{r.isActive ? "نشط" : "غير نشط"}</Badge> },
          { header: "تاريخ الإنشاء", cell: (r) => new Date(r.createdAt).toLocaleDateString("ar-DZ") },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل الإعلان" : "إضافة إعلان"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>العنوان (عربي)</Label><Input value={form.titleAr} onChange={f("titleAr")} /></div>
            <div className="space-y-1"><Label>العنوان (فرنسي)</Label><Input value={form.title} onChange={f("title")} /></div>
          </div>
          <div className="space-y-1"><Label>المحتوى (عربي)</Label><Textarea value={form.contentAr} onChange={f("contentAr")} rows={3} /></div>
          <div className="space-y-1"><Label>المحتوى (فرنسي)</Label><Textarea value={form.content} onChange={f("content")} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>تاريخ البدء (اختياري)</Label><Input type="datetime-local" value={form.startsAt} onChange={f("startsAt")} /></div>
            <div className="space-y-1"><Label>تاريخ الانتهاء (اختياري)</Label><Input type="datetime-local" value={form.endsAt} onChange={f("endsAt")} /></div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm(p => ({ ...p, isActive: v }))} id="isActive" />
            <Label htmlFor="isActive">نشط</Label>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
