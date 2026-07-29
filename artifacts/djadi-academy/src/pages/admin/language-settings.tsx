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

const LANG_CODES = ["ar", "fr"];
const empty = { langCode: "ar", key: "", value: "" };

export default function AdminLanguageSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [filterLang, setFilterLang] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "language-settings", filterLang],
    queryFn: () => adminApi.languageSettings.list(filterLang || undefined),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "language-settings"] });

  const create = useMutation({ mutationFn: adminApi.languageSettings.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.languageSettings.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.languageSettings.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

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
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold flex-1">إدارة اللغات</h1>
        <Select value={filterLang} onValueChange={setFilterLang}>
          <SelectTrigger className="w-36"><SelectValue placeholder="كل اللغات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">كل اللغات</SelectItem>
            {LANG_CODES.map(l => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <CrudTable
        title={`إعدادات اللغة (${data?.length ?? 0})`}
        data={data}
        isLoading={isLoading}
        searchable
        searchPlaceholder="بحث عن مفتاح..."
        onAdd={() => open()}
        onEdit={open}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        columns={[
          { header: "اللغة", cell: (r) => <Badge variant="outline" className="font-mono">{r.langCode.toUpperCase()}</Badge> },
          { header: "المفتاح", cell: (r) => <code className="text-xs bg-muted px-1 py-0.5 rounded">{r.key}</code> },
          { header: "القيمة", cell: (r) => <span className="text-sm text-muted-foreground truncate max-w-xs block">{r.value}</span> },
        ]}
      />
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل الإعداد" : "إضافة إعداد"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>اللغة</Label>
            <Select value={form.langCode} onValueChange={(v) => setForm(p => ({ ...p, langCode: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANG_CODES.map(l => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
                <SelectItem value="custom">إضافة لغة أخرى...</SelectItem>
              </SelectContent>
            </Select>
            {form.langCode === "custom" && (
              <Input className="mt-2" placeholder="رمز اللغة (مثال: en)" onChange={(e) => setForm(p => ({ ...p, langCode: e.target.value }))} />
            )}
          </div>
          <div className="space-y-1"><Label>المفتاح</Label><Input value={form.key} onChange={f("key")} placeholder="app.title" /></div>
          <div className="space-y-1"><Label>القيمة</Label><Input value={form.value} onChange={f("value")} /></div>
        </div>
      </FormDialog>
    </div>
  );
}
