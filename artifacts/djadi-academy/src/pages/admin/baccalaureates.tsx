import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/components/pdf-viewer";
import { useToast } from "@/hooks/use-toast";

const GRADES = ["premiere", "deuxieme", "troisieme"];

// Range of selectable years (most recent first)
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2009 }, (_, i) => CURRENT_YEAR - i);

const empty = {
  year: CURRENT_YEAR,
  subject: "", subjectAr: "",
  grade: "troisieme",
  link: "",
};

export default function AdminBaccalaureates() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "baccalaureates"],
    queryFn: adminApi.baccalaureates.list,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "baccalaureates"] });

  const create = useMutation({ mutationFn: adminApi.baccalaureates.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.baccalaureates.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del    = useMutation({ mutationFn: adminApi.baccalaureates.delete, onSuccess: () => { invalidate(); toast({ title: "تم الحذف" }); } });

  function open(row?: any) {
    if (row) { setEditing(row); setForm({ ...empty, ...row }); }
    else     { setEditing(null); setForm(empty); }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    const body = { ...form, year: Number(form.year) };
    if (editing) update.mutate({ id: editing.id, body });
    else         create.mutate(body);
  }

  const f = (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة امتحانات البكالوريا السابقة</h1>

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
          { header: "السنة",    cell: (r) => <span className="font-bold text-primary">{r.year}</span> },
          { header: "المادة",   cell: (r) => r.subjectAr },
          { header: "المستوى", cell: (r) => r.grade },
          { header: "عرض PDF", cell: (r) => r.link ? (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPdfPreview({ url: r.link, title: `بكالوريا ${r.year} — ${r.subjectAr}` })}>
              <Eye className="h-3.5 w-3.5" />عرض
            </Button>
          ) : null },
        ]}
      />

      <FormDialog
        open={dialogOpen}
        onClose={close}
        title={editing ? "تعديل الموضوع" : "إضافة موضوع بكالوريا"}
        onSubmit={submit}
        isSubmitting={create.isPending || update.isPending}
      >
        <div className="space-y-4">
          {/* Year — card grid */}
          <div className="space-y-2">
            <Label>السنة</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, year: y }))}
                  className={`rounded-lg border py-2 text-sm font-semibold transition-colors
                    ${form.year === y
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted hover:bg-muted/70 border-transparent text-foreground"
                    }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div className="space-y-1">
            <Label>المستوى</Label>
            <Select value={form.grade} onValueChange={(v) => setForm((p) => ({ ...p, grade: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Subject names */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>اسم المادة (عربي)</Label>
              <Input value={form.subjectAr} onChange={f("subjectAr")} placeholder="الرياضيات" />
            </div>
            <div className="space-y-1">
              <Label>اسم المادة (فرنسي)</Label>
              <Input value={form.subject} onChange={f("subject")} placeholder="Mathématiques" />
            </div>
          </div>

          {/* PDF link */}
          <div className="space-y-1">
            <Label>رابط PDF</Label>
            <Input value={form.link} onChange={f("link")} placeholder="https://..." />
          </div>
        </div>
      </FormDialog>

      {pdfPreview && (
        <PdfViewer url={pdfPreview.url} title={pdfPreview.title} onClose={() => setPdfPreview(null)} />
      )}
    </div>
  );
}
