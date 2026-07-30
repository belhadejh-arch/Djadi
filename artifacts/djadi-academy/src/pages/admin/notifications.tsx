import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const empty = { titleAr: "", bodyAr: "" };

export default function AdminNotifications() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "notifications"], queryFn: adminApi.notifications.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] });

  const send = useMutation({
    mutationFn: adminApi.notifications.send,
    onSuccess: () => { invalidate(); setDialogOpen(false); setForm(empty); toast({ title: "تم إرسال الإشعار لجميع المستخدمين" }); },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: adminApi.notifications.delete,
    onSuccess: () => { invalidate(); setDeleteId(null); toast({ title: "تم الحذف" }); },
  });

  const f = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  function submit() {
    if (!form.titleAr.trim()) { toast({ title: "يجب إدخال عنوان الإشعار", variant: "destructive" }); return; }
    if (!form.bodyAr.trim())  { toast({ title: "يجب إدخال نص الإشعار", variant: "destructive" }); return; }
    send.mutate({
      title: form.titleAr,
      titleAr: form.titleAr,
      body: form.bodyAr,
      bodyAr: form.bodyAr,
      targetType: "all",
      targetId: null,
    });
  }

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
        <CardHeader className="pb-3">
          <CardTitle className="text-base">الإشعارات المرسلة ({data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground text-center py-4">جاري التحميل...</p>}
          {!isLoading && !data?.length && (
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد إشعارات</p>
          )}
          {data?.map((n: any) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm mb-0.5">{n.titleAr}</p>
                <p className="text-xs text-muted-foreground">{n.bodyAr}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {n.sentAt ? new Date(n.sentAt).toLocaleString("ar-DZ") : "—"} · جميع المستخدمين
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => setDeleteId(n.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <FormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setForm(empty); }}
        title="إرسال إشعار لجميع المستخدمين"
        onSubmit={submit}
        isSubmitting={send.isPending}
        submitLabel="إرسال"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            سيُرسل هذا الإشعار تلقائياً إلى جميع المستخدمين المسجلين في المنصة.
          </p>
          <div className="space-y-1">
            <Label>عنوان الإشعار <span className="text-destructive">*</span></Label>
            <Input value={form.titleAr} onChange={f("titleAr")} placeholder="مثال: تحديث جديد للمنصة" />
          </div>
          <div className="space-y-1">
            <Label>نص الإشعار <span className="text-destructive">*</span></Label>
            <Textarea value={form.bodyAr} onChange={f("bodyAr")} rows={4} placeholder="اكتب نص الإشعار هنا..." />
          </div>
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
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && del.mutate(deleteId)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
