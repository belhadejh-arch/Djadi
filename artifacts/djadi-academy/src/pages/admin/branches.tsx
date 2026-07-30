import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { getListBranchesQueryKey } from "@workspace/api-client-react";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const empty = { nameAr: "", nameFr: "", code: "", levelIds: [] as number[], sortOrder: 0 };

export default function AdminBranches() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const { data: levels = [] } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "branches"] });
    // Also invalidate student-facing branches so changes appear immediately
    qc.invalidateQueries({ queryKey: getListBranchesQueryKey() });
  };

  const create = useMutation({ mutationFn: adminApi.branches.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.branches.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.branches.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) {
      const levelIds = Array.isArray(row.levelIds) && row.levelIds.length > 0
        ? row.levelIds
        : row.levelId ? [row.levelId] : [];
      setEditing(row);
      setForm({ nameAr: row.nameAr, nameFr: row.nameFr, code: row.code, levelIds, sortOrder: row.sortOrder ?? 0 });
    } else {
      setEditing(null);
      setForm(empty);
    }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    if (form.levelIds.length === 0) {
      toast({ title: "يجب اختيار مستوى واحد على الأقل", variant: "destructive" });
      return;
    }
    if (editing) update.mutate({ id: editing.id, body: form });
    else create.mutate(form);
  }

  const f = (k: "nameAr" | "nameFr" | "code") =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  function toggleLevel(levelId: number, checked: boolean) {
    setForm((p) => ({
      ...p,
      levelIds: checked
        ? [...p.levelIds, levelId]
        : p.levelIds.filter((id) => id !== levelId),
    }));
  }

  // Build a level name lookup from levels list
  const levelMap = Object.fromEntries((levels as any[]).map((l) => [l.id, l.nameAr]));

  function getLevelNames(row: any): string {
    const ids: number[] = Array.isArray(row.levelIds) && row.levelIds.length > 0
      ? row.levelIds
      : row.levelId ? [row.levelId] : [];
    return ids.map((id) => levelMap[id] ?? `#${id}`).join("، ");
  }

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
          {
            header: "المستويات",
            cell: (r) => (
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(r.levelIds) && r.levelIds.length > 0 ? r.levelIds : [r.levelId]).map((id: number) => (
                  <Badge key={id} variant="secondary" className="text-xs">{levelMap[id] ?? `#${id}`}</Badge>
                ))}
              </div>
            ),
          },
          { header: "الترتيب", cell: (r) => r.sortOrder },
        ]}
      />

      <FormDialog
        open={dialogOpen}
        onClose={close}
        title={editing ? "تعديل الشعبة" : "إضافة شعبة"}
        onSubmit={submit}
        isSubmitting={create.isPending || update.isPending}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>الاسم بالعربية <span className="text-destructive">*</span></Label>
            <Input value={form.nameAr} onChange={f("nameAr")} placeholder="علوم تجريبية" />
          </div>
          <div className="space-y-1">
            <Label>الاسم بالفرنسية <span className="text-destructive">*</span></Label>
            <Input value={form.nameFr} onChange={f("nameFr")} placeholder="Sciences Expérimentales" />
          </div>
          <div className="space-y-1">
            <Label>الكود <span className="text-destructive">*</span></Label>
            <Input value={form.code} onChange={f("code")} placeholder="sciences" />
          </div>

          {/* Multi-level selection */}
          <div className="space-y-2">
            <Label>
              المستويات <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground mr-1">(يمكن اختيار أكثر من مستوى)</span>
            </Label>
            <div className="border rounded-md p-3 space-y-2">
              {(levels as any[]).length === 0 && (
                <p className="text-sm text-muted-foreground">لا توجد مستويات بعد</p>
              )}
              {(levels as any[]).map((l) => (
                <div key={l.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`level-${l.id}`}
                    checked={form.levelIds.includes(l.id)}
                    onCheckedChange={(checked) => toggleLevel(l.id, Boolean(checked))}
                  />
                  <label htmlFor={`level-${l.id}`} className="text-sm cursor-pointer select-none">
                    {l.nameAr}
                    {l.nameFr && <span className="text-muted-foreground mr-1">({l.nameFr})</span>}
                  </label>
                </div>
              ))}
            </div>
            {form.levelIds.length === 0 && (
              <p className="text-xs text-destructive">يجب اختيار مستوى واحد على الأقل</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>الترتيب</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
