import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import {
  Users, GraduationCap, GitBranch, BookOpen, FileText, File, Video,
  ScrollText, FlaskConical, Award, Youtube, PlayCircle,
  TrendingUp, UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADE_LABELS: Record<string, string> = {
  premiere: "1ère Secondaire",
  deuxieme: "2ème Secondaire",
  troisieme: "3ème Secondaire",
};
const TYPE_LABELS: Record<string, string> = { pdf: "PDF", video: "فيديو", link: "رابط" };
const PIE_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  color = "text-primary",
  bg = "bg-muted",
}: {
  title: string;
  value?: number | string;
  icon: React.ElementType;
  href?: string;
  color?: string;
  bg?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {value !== undefined ? (
            <p className="text-2xl font-bold">{value}</p>
          ) : (
            <Skeleton className="h-7 w-14 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href}>
      <div className="cursor-pointer">{content}</div>
    </Link>
  ) : (
    content
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => adminApi.dashboard.stats(),
  });

  const counts = stats?.counts;

  // Prepare chart data
  const gradeData = (stats?.usersByGrade ?? []).map((g: any) => ({
    name: GRADE_LABELS[g.grade] ?? g.grade ?? "غير محدد",
    value: Number(g.total),
  }));

  const typeData = (stats?.lessonsByType ?? []).map((t: any) => ({
    name: TYPE_LABELS[t.type] ?? t.type,
    value: Number(t.total),
  }));

  const subjectData = (stats?.topSubjectsByLessons ?? []).map((s: any) => ({
    name: s.subjectNameAr ?? s.subjectName ?? "غير معروف",
    دروس: Number(s.total),
  }));

  // Build last 7 days array (fill missing dates with 0)
  const dailyData = (() => {
    const map: Record<string, number> = {};
    (stats?.dailyRegistrations ?? []).forEach((r: any) => {
      map[r.date] = Number(r.total);
    });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: d.toLocaleDateString("ar-DZ", { month: "short", day: "numeric" }), value: map[key] ?? 0 };
    });
  })();

  // Build last 6 months array
  const monthlyData = (() => {
    const map: Record<string, number> = {};
    (stats?.monthlyRegistrations ?? []).forEach((r: any) => {
      map[r.month] = Number(r.total);
    });
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      const key = d.toISOString().slice(0, 7);
      return {
        month: d.toLocaleDateString("ar-DZ", { month: "short", year: "2-digit" }),
        value: map[key] ?? 0,
      };
    });
  })();

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">إحصائيات شاملة لمنصة أكاديمية جادي</p>
      </div>

      {/* Users */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">المستخدمون</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="إجمالي المستخدمين" value={counts?.users} icon={Users} href="/admin/users" />
          <StatCard title="المستويات" value={counts?.levels} icon={GraduationCap} href="/admin/levels" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950" />
          <StatCard title="الشعب" value={counts?.branches} icon={GitBranch} href="/admin/branches" color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950" />
          <StatCard title="المواد الدراسية" value={counts?.subjects} icon={BookOpen} href="/admin/subjects" color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950" />
        </div>
      </section>

      {/* Content */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">المحتوى</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <StatCard title="الدروس" value={counts?.lessons} icon={FileText} href="/admin/lessons" />
          <StatCard title="ملفات PDF" value={counts?.pdfs} icon={File} href="/admin/lessons" color="text-red-600" bg="bg-red-50 dark:bg-red-950" />
          <StatCard title="فيديوهات الدروس" value={counts?.videos} icon={Video} href="/admin/lessons" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950" />
          <StatCard title="الفروض" value={counts?.exams} icon={ScrollText} href="/admin/exams" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-950" />
          <StatCard title="الاختبارات" value={counts?.tests} icon={FlaskConical} href="/admin/tests" color="text-teal-600" bg="bg-teal-50 dark:bg-teal-950" />
          <StatCard title="البكالوريات" value={counts?.baccalaureates} icon={Award} href="/admin/baccalaureates" color="text-yellow-600" bg="bg-yellow-50 dark:bg-yellow-950" />
          <StatCard title="قنوات المراجعة" value={counts?.channels} icon={Youtube} href="/admin/review-channels" color="text-rose-600" bg="bg-rose-50 dark:bg-rose-950" />
          <StatCard title="فيديوهات القنوات" value={counts?.channelVideos} icon={PlayCircle} href="/admin/review-channels" color="text-pink-600" bg="bg-pink-50 dark:bg-pink-950" />
        </div>
      </section>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Users by grade */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              توزيع المستخدمين حسب المستوى
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={gradeData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="المستخدمون" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>

        {/* Lessons by type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              توزيع الدروس حسب النوع
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {typeData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily registrations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              التسجيلات اليومية (آخر 7 أيام)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="تسجيلات" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly registrations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              التسجيلات الشهرية (آخر 6 أشهر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="تسجيلات" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top subjects */}
      {subjectData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              أكثر المواد محتوىً (حسب عدد الدروس)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="دروس" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent users */}
      {stats?.recentUsers && stats.recentUsers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              آخر المستخدمين المسجلين
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {u.fullName?.charAt(0) ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-left shrink-0 mr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
                      {u.isActive ? "نشط" : "موقوف"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(u.createdAt).toLocaleDateString("ar-DZ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
