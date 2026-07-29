import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX } from "lucide-react";

const GRADES = ["premiere", "deuxieme", "troisieme"];

const emptyForm = { fullName: "", email: "", password: "", grade: "", role: "student" as const, isActive: true };

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: () => adminApi.users.list({ page, search: search || undefined, limit: 20 }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const create = useMutation({ mutationFn: adminApi.users.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.users.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.users.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });
  const activate = useMutation({ mutationFn: adminApi.users.activate, onSuccess: invalidate });
  const deactivate = useMutation({ mutationFn: adminApi.users.deactivate, onSuccess: invalidate });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...emptyForm, ...row, password: "" }); }
    else { setEditing(null); setForm(emptyForm); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    const body = { ...form, grade: form.grade || undefined };
    if (!form.password && editing) delete (body as any).password;
    if (editing) update.mutate({ id: editing.id, body });
    else create.mutate(body);
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold flex-1 min-w-[120px]">إدارة المستخدمين</h1>
        <Input
          className="w-full sm:max-w-xs text-sm"
          placeholder="بحث بالاسم أو البريد..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <CrudTable
        title={`المستخدمون (${data?.total ?? "…"})`}
        data={data?.data}
        isLoading={isLoading}
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "الاسم", cell: (r) => <span className="font-medium">{r.fullName}</span> },
          { header: "البريد الإلكتروني", cell: (r) => <span className="text-muted-foreground text-xs">{r.email}</span> },
          { header: "المستوى", cell: (r) => r.grade ?? "—" },
          { header: "الدور", cell: (r) => <Badge variant={r.role === "super_admin" ? "default" : "secondary"}>{r.role === "super_admin" ? "مدير" : "طالب"}</Badge> },
          { header: "الحالة", cell: (r) => <Badge variant={r.isActive ? "outline" : "destructive"} className={r.isActive ? "border-green-500 text-green-600" : ""}>{r.isActive ? "نشط" : "موقوف"}</Badge> },
        ]}
        extraActions={(r) => (
          r.isActive
            ? <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deactivate.mutate(r.id)} title="إيقاف"><UserX className="h-3.5 w-3.5" /></Button>
            : <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-green-600" onClick={() => activate.mutate(r.id)} title="تفعيل"><UserCheck className="h-3.5 w-3.5" /></Button>
        )}
      />

      {data && data.total > data.limit && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
          <span className="text-muted-foreground">{page} / {Math.ceil(data.total / data.limit)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / data.limit)} onClick={() => setPage(p => p + 1)}>التالي</Button>
        </div>
      )}

      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل المستخدم" : "إضافة مستخدم"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>الاسم الكامل</Label>
            <Input value={form.fullName} onChange={f("fullName")} placeholder="محمد أمين بوعزيز" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" value={form.email} onChange={f("email")} placeholder="user@example.com" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>{editing ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور"}</Label>
            <Input type="password" value={form.password} onChange={f("password")} placeholder="••••••••" />
          </div>
          <div className="space-y-1">
            <Label>المستوى</Label>
            <Select value={form.grade} onValueChange={(v) => setForm(p => ({ ...p, grade: v }))}>
              <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">غير محدد</SelectItem>
                {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>الدور</Label>
            <Select value={form.role} onValueChange={(v) => setForm(p => ({ ...p, role: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">طالب</SelectItem>
                <SelectItem value="super_admin">مدير عام</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
