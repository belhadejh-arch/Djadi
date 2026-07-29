import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TARGET_TYPES = [
  { value: "all", label: "جميع المستخدمين" },
  { value: "level", label: "حسب المستوى" },
  { value: "branch", label: "حسب الشعبة" },
  { value: "subject", label: "حسب المادة" },
];

const empty = { title: "", titleAr: "", body: "", bodyAr: "", targetType: "all", targetId: null as number | null };

export default function AdminNotifications() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "notifications"], queryFn: adminApi.notifications.list });
  const { data: levels } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  const { data: branches } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const { data: subjects } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] });

  const send = useMutation({
    mutationFn: adminApi.notifications.send,
    onSuccess: () => { invalidate(); setDialogOpen(false); setForm(empty); toast({ title: "تم إرسال الإشعار" }); }
  });
  const del = useMutation({ mutationFn: adminApi.notifications.delete, onSuccess: () => { invalidate(); setDeleteId(null); toast({ title: "تم الحذف" }); } });

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const targetOptions = form.targetType === "level" ? levels
    : form.targetType === "branch" ? branches
    : form.targetType === "subject" ? subjects
    : null;

  const targetLabel = (n: any) =>
    n.nameAr ?? n.name ?? String(n.id);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">إدارة الإشعارات</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Send className="h-4 w-4 ml-1.5" />
          إرسال إشعار
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">الإشعارات المرسلة ({data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground text-center py-4">جاري التحميل...</p>}
          {!isLoading && !data?.length && <p className="text-sm text-muted-foreground text-center py-4">لا توجد إشعارات</p>}
          {data?.map((n: any) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{n.titleAr}</p>
                  <Badge variant="outline" className="text-xs">{TARGET_TYPES.find(t => t.value === n.targetType)?.label ?? n.targetType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{n.bodyAr}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.sentAt ? new Date(n.sentAt).toLocaleString("ar-DZ") : "—"}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setDeleteId(n.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="إرسال إشعار جديد" onSubmit={() => send.mutate({ ...form, targetId: form.targetId || null })} isSubmitting={send.isPending} submitLabel="إرسال">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>العنوان (عربي)</Label><Input value={form.titleAr} onChange={f("titleAr")} /></div>
            <div className="space-y-1"><Label>العنوان (فرنسي)</Label><Input value={form.title} onChange={f("title")} /></div>
          </div>
          <div className="space-y-1"><Label>النص (عربي)</Label><Textarea value={form.bodyAr} onChange={f("bodyAr")} rows={3} /></div>
          <div className="space-y-1"><Label>النص (فرنسي)</Label><Textarea value={form.body} onChange={f("body")} rows={3} /></div>
          <div className="space-y-1">
            <Label>إرسال إلى</Label>
            <Select value={form.targetType} onValueChange={(v) => setForm(p => ({ ...p, targetType: v, targetId: null }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TARGET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {targetOptions && (
            <div className="space-y-1">
              <Label>اختر {TARGET_TYPES.find(t => t.value === form.targetType)?.label}</Label>
              <Select value={form.targetId ? String(form.targetId) : ""} onValueChange={(v) => setForm(p => ({ ...p, targetId: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
                <SelectContent>{(targetOptions as any[]).map((o) => <SelectItem key={o.id} value={String(o.id)}>{targetLabel(o)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
      </FormDialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإشعار</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الإشعار؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteId && del.mutate(deleteId)}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
