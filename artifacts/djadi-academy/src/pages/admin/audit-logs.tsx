import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, ChevronRight, ChevronLeft, Filter } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  LOGIN:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  RESTORE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const ENTITY_LABELS: Record<string, string> = {
  users: "المستخدمون",
  lessons: "الدروس",
  subjects: "المواد",
  levels: "المستويات",
  branches: "الشعب",
  exams: "الفروض",
  tests: "الاختبارات",
  baccalaureates: "البكالوريا",
  "review-channels": "قنوات المراجعة",
  announcements: "الإعلانات",
  notifications: "الإشعارات",
  "language-settings": "إعدادات اللغة",
  backup: "النسخ الاحتياطي",
};

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-logs", page],
    queryFn: () => adminApi.auditLogs.list({ page, limit: LIMIT }),
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">سجل المراجعة</h1>
        <p className="text-muted-foreground text-sm mt-1">
          جميع الإجراءات الإدارية مسجلة هنا — {data?.total ?? "…"} سجل إجمالاً
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            سجلات النشاط
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data?.data?.length ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد سجلات بعد</p>
              <p className="text-xs mt-1">ستظهر هنا إجراءات المديرين تلقائياً بعد تطبيق مخطط قاعدة البيانات</p>
            </div>
          ) : (
            <>
              <div className="divide-y text-sm">
                {data.data.map((log: any) => (
                  <div key={log.id} className="flex items-start justify-between px-5 py-3 gap-3 hover:bg-muted/30">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"}`}>
                        {log.action}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium">
                          {ENTITY_LABELS[log.entity] ?? log.entity}
                          {log.entityId ? <span className="text-muted-foreground font-normal"> #{log.entityId}</span> : null}
                        </p>
                        {log.detail && (
                          <p className="text-xs text-muted-foreground truncate">{log.detail}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{log.adminEmail}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 text-left">
                      <p>{new Date(log.createdAt).toLocaleString("ar-DZ")}</p>
                      {log.ip && <p className="font-mono opacity-70">{log.ip}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="gap-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    صفحة {page} من {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-1"
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
