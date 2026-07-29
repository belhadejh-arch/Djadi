import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Download, Trash2, RotateCcw, Plus, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminBackup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const { data: backups, isLoading } = useQuery({
    queryKey: ["admin", "backup", "list"],
    queryFn: () => adminApi.backup.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.backup.create(),
    onSuccess: () => {
      toast({ title: "✅ تم إنشاء النسخة الاحتياطية بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["admin", "backup", "list"] });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.backup.delete(id),
    onSuccess: () => {
      toast({ title: "تم حذف النسخة الاحتياطية" });
      queryClient.invalidateQueries({ queryKey: ["admin", "backup", "list"] });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const handleDownload = (id: string) => {
    const link = document.createElement("a");
    link.href = adminApi.backup.downloadUrl(id);
    link.download = `${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    let json: any;
    try {
      const text = await file.text();
      json = JSON.parse(text);
    } catch {
      toast({ title: "خطأ", description: "الملف غير صالح — تأكد أنه ملف JSON صحيح", variant: "destructive" });
      return;
    }

    setRestoreId("__file__");
    (window as any).__restorePayload = json;
  };

  const handleConfirmRestore = async () => {
    if (!restoreId) return;
    setRestoring(true);
    setRestoreId(null);
    try {
      const payload = (window as any).__restorePayload;
      await adminApi.backup.restore(payload);
      toast({ title: "✅ تمت الاستعادة بنجاح", description: "تم استعادة بيانات المحتوى من النسخة الاحتياطية." });
      queryClient.invalidateQueries();
    } catch (e: any) {
      toast({ title: "خطأ في الاستعادة", description: e.message, variant: "destructive" });
    } finally {
      setRestoring(false);
      delete (window as any).__restorePayload;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
        <p className="text-muted-foreground text-sm mt-1">إنشاء نسخ احتياطية من بيانات المنصة وإدارتها</p>
      </div>

      {/* Notice */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
        <CardContent className="flex gap-3 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <p className="font-semibold">تنبيه مهم</p>
            <p>النسخ الاحتياطية تشمل جميع بيانات المحتوى (مستويات، شعب، مواد، دروس، فروض، اختبارات، بكالوريا، قنوات، إعلانات، إشعارات، إعدادات اللغة).</p>
            <p>لا تُحفظ كلمات مرور المستخدمين في النسخة الاحتياطية لأسباب أمنية.</p>
            <p>الاستعادة ستحذف البيانات الحالية وتستبدلها بالبيانات المحفوظة.</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء نسخة احتياطية"}
        </Button>

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={restoring}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {restoring ? "جاري الاستعادة..." : "استعادة من ملف"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleRestoreFromFile}
        />
      </div>

      {/* Backup list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            النسخ الاحتياطية المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !backups || backups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Database className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد نسخ احتياطية بعد</p>
              <p className="text-xs mt-1">انقر "إنشاء نسخة احتياطية" لإنشاء أول نسخة</p>
            </div>
          ) : (
            <div className="divide-y">
              {backups.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{b.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.createdAt).toLocaleString("ar-DZ")} · {formatBytes(b.sizeBytes)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => handleDownload(b.id)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      تنزيل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(b.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف النسخة الاحتياطية</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه النسخة الاحتياطية؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null); }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore confirm */}
      <AlertDialog open={!!restoreId} onOpenChange={(o) => !o && setRestoreId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              تأكيد الاستعادة
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم <strong>حذف جميع بيانات المحتوى الحالية</strong> واستبدالها بالبيانات الموجودة في الملف المحدد.
              هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleConfirmRestore}
            >
              نعم، استعادة الآن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
