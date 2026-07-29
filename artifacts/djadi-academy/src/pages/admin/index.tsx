import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { Users, UserCheck, UserX, GraduationCap, BookOpen, FileText, Bell, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

function StatCard({
  title, value, icon: Icon, href, color = "text-primary",
}: {
  title: string; value?: number | string; icon: React.ElementType;
  href?: string; color?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-2.5 rounded-xl bg-muted ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {value !== undefined ? (
            <p className="text-2xl font-bold">{value}</p>
          ) : (
            <Skeleton className="h-7 w-16 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { data: userStats } = useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: () => adminApi.users.stats(),
  });
  const { data: subjects } = useQuery({
    queryKey: ["admin", "subjects"],
    queryFn: () => adminApi.subjects.list(),
  });
  const { data: lessons } = useQuery({
    queryKey: ["admin", "lessons"],
    queryFn: () => adminApi.lessons.list(),
  });
  const { data: announcements } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () => adminApi.announcements.list(),
  });
  const { data: notifications } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => adminApi.notifications.list(),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">مرحباً بك في لوحة إدارة أكاديمية جادي</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">المستخدمون</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="إجمالي المستخدمين" value={userStats?.total} icon={Users} href="/admin/users" />
          <StatCard title="نشطون" value={userStats?.active} icon={UserCheck} href="/admin/users" color="text-green-600" />
          <StatCard title="موقوفون" value={userStats?.inactive} icon={UserX} href="/admin/users" color="text-destructive" />
          <StatCard title="مديرون" value={userStats?.admins} icon={GraduationCap} href="/admin/users" color="text-amber-600" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">المحتوى</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="المواد" value={subjects?.length} icon={BookOpen} href="/admin/subjects" />
          <StatCard title="الدروس" value={lessons?.length} icon={FileText} href="/admin/lessons" />
          <StatCard title="الإعلانات" value={announcements?.length} icon={Megaphone} href="/admin/announcements" />
          <StatCard title="الإشعارات المرسلة" value={notifications?.length} icon={Bell} href="/admin/notifications" />
        </div>
      </div>

      {userStats?.byGrade && userStats.byGrade.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">توزيع المستويات</h2>
          <Card>
            <CardContent className="p-4 space-y-2">
              {userStats.byGrade.map((g: any) => (
                <div key={g.grade ?? "unset"} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{g.grade ?? "غير محدد"}</span>
                  <span className="font-semibold">{g.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
