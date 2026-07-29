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
const empty = { year: new Date().getFullYear(), subject: "", subjectAr: "", grade: "troisieme", link: "" };

export default function AdminBaccalaureates() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "baccalaureates"], queryFn: adminApi.baccalaureates.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "baccalaureates"] });

  const create = useMutation({ mutationFn: adminApi.baccalaureates.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.baccalaureates.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.baccalaureates.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row }); }
    else { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }
  function submit() {
    const body = { ...form, year: Number(form.year) };
    if (editing) update.mutate({ id: editing.id, body });
    else create.mutate(body);
  }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة البكالوريات السابقة</h1>
      <CrudTable
        title="بكالوريات سابقة"
        data={data}
        isLoading={isLoading}
        searchable
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "السنة", cell: (r) => <span className="font-bold">{r.year}</span> },
          { header: "المادة (عربي)", cell: (r) => r.subjectAr },
          { header: "المادة (فرنسي)", cell: (r) => r.subject },
          { header: "المستوى", cell: (r) => r.grade },
          { header: "الرابط", cell: (r) => <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-xs hover:underline"><ExternalLink className="h-3 w-3" />فتح</a> },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل الموضوع" : "إضافة موضوع"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>السنة</Label><Input type="number" value={form.year} onChange={f("year")} /></div>
            <div className="space-y-1">
              <Label>المستوى</Label>
              <Select value={form.grade} onValueChange={(v) => setForm(p => ({ ...p, grade: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label>اسم المادة (عربي)</Label><Input value={form.subjectAr} onChange={f("subjectAr")} placeholder="الرياضيات" /></div>
          <div className="space-y-1"><Label>اسم المادة (فرنسي)</Label><Input value={form.subject} onChange={f("subject")} placeholder="Mathématiques" /></div>
          <div className="space-y-1"><Label>الرابط</Label><Input value={form.link} onChange={f("link")} placeholder="https://..." /></div>
        </div>
      </FormDialog>
    </div>
  );
}
