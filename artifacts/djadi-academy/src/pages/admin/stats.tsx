/**
 * Admin Statistics page — /admin/stats
 * Comprehensive platform analytics for admins
 */
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import {
  Users, UserCheck, BookOpen, FileText, PenLine, Home,
  Award, Eye, TrendingUp, GitBranch, BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = [
  "#16a34a", "#2563eb", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  lesson:   "دروس",
  exam:     "فروض",
  test:     "اختبارات",
  homework: "واجبات",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title, value, icon: Icon, color, bg, subtitle,
}: {
  title: string;
  value?: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  subtitle?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${bg} ${color} shrink-0 mt-0.5`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          {value !== undefined ? (
            <p className="text-2xl font-extrabold mt-0.5 tabular-nums">{Number(value).toLocaleString("ar-DZ")}</p>
          ) : (
            <Skeleton className="h-7 w-16 mt-1" />
          )}
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-base font-bold">{title}</h2>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardContent className="p-5"><Skeleton className="h-56 w-full" /></CardContent></Card>
        <Card><CardContent className="p-5"><Skeleton className="h-56 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.stats.get(),
    staleTime: 60 * 1000,
  });

  if (isLoading) return <StatsSkeleton />;

  const c = stats?.counts ?? {};

  // Active students percentage
  const activePercent = c.totalStudents > 0
    ? Math.round((c.activeStudents / c.totalStudents) * 100)
    : 0;

  // Top subjects chart data
  const subjectData = (stats?.topSubjectsByVisits ?? [])
    .filter((s: any) => s.subjectName)
    .map((s: any) => ({
      name: s.subjectName as string,
      زيارات: Number(s.total),
    }));

  // Top branches chart data
  const branchData = (stats?.topBranchesByActivity ?? []).map((b: any) => ({
    name: b.branchNameAr ?? b.branchNameFr ?? "غير معروف",
    نشاط: Number(b.total),
  }));

  // Views by content type (pie)
  const typeData = (stats?.viewsByContentType ?? []).map((t: any) => ({
    name: CONTENT_TYPE_LABELS[t.contentType ?? "lesson"] ?? t.contentType,
    value: Number(t.total),
  }));

  // Daily views last 14 days
  const dailyData = (() => {
    const map: Record<string, number> = {};
    (stats?.dailyViews ?? []).forEach((r: any) => { map[r.date] = Number(r.total); });
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        date: d.toLocaleDateString("ar-DZ", { month: "short", day: "numeric" }),
        مشاهدات: map[key] ?? 0,
      };
    });
  })();

  return (
    <div className="space-y-8" dir="rtl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">الإحصائيات</h1>
          <p className="text-sm text-muted-foreground">نظرة شاملة على نشاط المنصة</p>
        </div>
      </div>

      {/* ── Section 1: Users ── */}
      <section>
        <SectionHeader icon={Users} title="الطلبة" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="إجمالي الطلبة المسجلين"
            value={c.totalStudents}
            icon={Users}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title="الطلبة النشطون"
            value={c.activeStudents}
            icon={UserCheck}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-100 dark:bg-emerald-900/30"
            subtitle={c.totalStudents > 0 ? `${activePercent}% من إجمالي الطلبة` : undefined}
          />
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardContent className="p-5 flex items-center gap-4 h-full">
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">نسبة النشاط</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${activePercent}%` }}
                      />
                    </div>
                    <span className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0">
                      {activePercent}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {c.activeStudents?.toLocaleString("ar-DZ")} نشط من أصل {c.totalStudents?.toLocaleString("ar-DZ")} طالب
                  </p>
                </div>
                <UserCheck className="w-10 h-10 text-emerald-500/30 shrink-0" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Section 2: Content ── */}
      <section>
        <SectionHeader icon={BookOpen} title="المحتوى التعليمي" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatCard
            title="الدروس"
            value={c.totalLessons}
            icon={BookOpen}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title="الفروض"
            value={c.totalExams}
            icon={FileText}
            color="text-purple-600 dark:text-purple-400"
            bg="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            title="الاختبارات"
            value={c.totalTests}
            icon={PenLine}
            color="text-amber-600 dark:text-amber-400"
            bg="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            title="الواجبات المنزلية"
            value={c.totalHomework}
            icon={Home}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            title="ملفات البكالوريا"
            value={c.totalBaccalaureates}
            icon={Award}
            color="text-orange-600 dark:text-orange-400"
            bg="bg-orange-100 dark:bg-orange-900/30"
          />
        </div>
      </section>

      {/* ── Section 3: Activity ── */}
      <section>
        <SectionHeader icon={Eye} title="المشاهدات والنشاط" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <StatCard
            title="إجمالي مرات المشاهدة"
            value={c.totalFileViews}
            icon={Eye}
            color="text-rose-600 dark:text-rose-400"
            bg="bg-rose-100 dark:bg-rose-900/30"
            subtitle="عبر جميع أنواع المحتوى"
          />

          {/* Content type breakdown */}
          {typeData.length > 0 && (
            <Card className="md:col-span-2">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">توزيع المشاهدات حسب النوع</p>
                  {typeData.map((t, i) => {
                    const pct = c.totalFileViews > 0 ? Math.round((t.value / c.totalFileViews) * 100) : 0;
                    return (
                      <div key={t.name} className="flex items-center gap-2">
                        <span className="text-xs w-16 shrink-0 font-medium">{t.name}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-left shrink-0 tabular-nums">{t.value.toLocaleString("ar-DZ")}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Daily views chart */}
        {dailyData.some((d) => d.مشاهدات > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                المشاهدات اليومية (آخر 14 يوم)
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={1} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => [v.toLocaleString("ar-DZ"), "مشاهدات"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="مشاهدات"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#16a34a" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ── Section 4: Top subjects ── */}
      {subjectData.length > 0 && (
        <section>
          <SectionHeader icon={TrendingUp} title="أكثر المواد زيارة" />
          <Card>
            <CardContent className="pt-5 pb-5">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => [v.toLocaleString("ar-DZ"), "زيارة"]}
                  />
                  <Bar dataKey="زيارات" radius={[0, 4, 4, 0]}>
                    {subjectData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Section 5: Top branches ── */}
      {branchData.length > 0 && (
        <section>
          <SectionHeader icon={GitBranch} title="أكثر الشعب نشاطاً" />
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-5 pb-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={branchData} margin={{ top: 0, right: 16, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number) => [v.toLocaleString("ar-DZ"), "نشاط"]}
                    />
                    <Bar dataKey="نشاط" radius={[4, 4, 0, 0]}>
                      {branchData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 pb-5 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={branchData}
                      dataKey="نشاط"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {branchData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number) => [v.toLocaleString("ar-DZ"), "نشاط"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Empty state when no activity yet */}
      {c.totalFileViews === 0 && subjectData.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center space-y-2">
            <BarChart2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="font-semibold text-muted-foreground">لا توجد بيانات نشاط بعد</p>
            <p className="text-sm text-muted-foreground">ستظهر المخططات بعد أن يبدأ الطلبة في استخدام المنصة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
