import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/lib/language-context';
import { NotificationsProvider } from '@/lib/notifications-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMe } from '@workspace/api-client-react';

// Layout & Auth (not lazy — small, needed immediately)
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminRoute } from '@/components/admin-route';

// ── Lazy-loaded student pages ───────────────────────────────────────────────
const Login               = lazy(() => import('@/pages/login'));
const Register            = lazy(() => import('@/pages/register'));
const GradeSelect         = lazy(() => import('@/pages/grade-select'));
const BranchSelect        = lazy(() => import('@/pages/branch-select'));
const LanguageSelect      = lazy(() => import('@/pages/language-select'));
const Dashboard           = lazy(() => import('@/pages/dashboard'));
const Subjects            = lazy(() => import('@/pages/subjects'));
const SubjectDetail       = lazy(() => import('@/pages/subject-detail'));
const Lessons             = lazy(() => import('@/pages/lessons'));
const LessonDetail        = lazy(() => import('@/pages/lesson-detail'));
const Baccalaureate       = lazy(() => import('@/pages/baccalaureate'));
const Notifications       = lazy(() => import('@/pages/notifications'));
const GradeCalculator     = lazy(() => import('@/pages/grade-calculator'));
const ScientificCalculator = lazy(() => import('@/pages/scientific-calculator'));
const ReviewChannels      = lazy(() => import('@/pages/review-channels'));
const Settings            = lazy(() => import('@/pages/settings'));
const Favorites           = lazy(() => import('@/pages/favorites'));
const About               = lazy(() => import('@/pages/about'));
const PrivacyPolicy       = lazy(() => import('@/pages/privacy-policy'));
const Terms               = lazy(() => import('@/pages/terms'));
const NotFound            = lazy(() => import('@/pages/not-found'));

// ── Lazy-loaded admin pages ─────────────────────────────────────────────────
const AdminDashboard      = lazy(() => import('@/pages/admin/index'));
const AdminUsers          = lazy(() => import('@/pages/admin/users'));
const AdminLevels         = lazy(() => import('@/pages/admin/levels'));
const AdminBranches       = lazy(() => import('@/pages/admin/branches'));
const AdminSubjects       = lazy(() => import('@/pages/admin/subjects'));
const AdminLessons        = lazy(() => import('@/pages/admin/lessons'));
const AdminExams          = lazy(() => import('@/pages/admin/exams'));
const AdminTests          = lazy(() => import('@/pages/admin/tests'));
const AdminBaccalaureates = lazy(() => import('@/pages/admin/baccalaureates'));
const AdminReviewChannels = lazy(() => import('@/pages/admin/review-channels'));
const AdminAnnouncements  = lazy(() => import('@/pages/admin/announcements'));
const AdminNotifications  = lazy(() => import('@/pages/admin/notifications'));
const AdminLanguageSettings = lazy(() => import('@/pages/admin/language-settings'));
const AdminBackup         = lazy(() => import('@/pages/admin/backup'));
const AdminAuditLogs      = lazy(() => import('@/pages/admin/audit-logs'));
const AdminHomework       = lazy(() => import('@/pages/admin/homework'));

// ── Query client (performance tuned) ───────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,          // data is fresh for 30 s
      gcTime: 5 * 60 * 1000,         // keep unused data 5 min
    },
  },
});

// ── Suspense fallback (skeleton) ────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

// Replaces splash — immediately redirects based on auth state
function HomeRedirect() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      if (user.role === 'super_admin') {
        setLocation('/admin');
      } else {
        setLocation(user.grade ? '/dashboard' : '/grade-select');
      }
    } else {
      setLocation('/login');
    }
  }, [isLoading, user, setLocation]);

  return null;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />

        <Route path="/grade-select">
          <ProtectedRoute><GradeSelect /></ProtectedRoute>
        </Route>
        <Route path="/branch-select">
          <ProtectedRoute><BranchSelect /></ProtectedRoute>
        </Route>
        <Route path="/language-select">
          <ProtectedRoute><LanguageSelect /></ProtectedRoute>
        </Route>

        {/* Protected Routes with Layout */}
        <Route path="/dashboard">
          <ProtectedLayout><Dashboard /></ProtectedLayout>
        </Route>
        <Route path="/subjects">
          <ProtectedLayout><Subjects /></ProtectedLayout>
        </Route>
        <Route path="/subjects/:id">
          <ProtectedLayout><SubjectDetail /></ProtectedLayout>
        </Route>
        <Route path="/lessons">
          <ProtectedLayout><Lessons /></ProtectedLayout>
        </Route>
        <Route path="/lessons/:id">
          <ProtectedLayout><LessonDetail /></ProtectedLayout>
        </Route>
        <Route path="/baccalaureate">
          <ProtectedLayout><Baccalaureate /></ProtectedLayout>
        </Route>
        <Route path="/notifications">
          <ProtectedLayout><Notifications /></ProtectedLayout>
        </Route>
        <Route path="/grade-calculator">
          <ProtectedLayout><GradeCalculator /></ProtectedLayout>
        </Route>
        <Route path="/scientific-calculator">
          <ProtectedLayout><ScientificCalculator /></ProtectedLayout>
        </Route>
        <Route path="/review-channels">
          <ProtectedLayout><ReviewChannels /></ProtectedLayout>
        </Route>
        <Route path="/settings">
          <ProtectedLayout><Settings /></ProtectedLayout>
        </Route>
        <Route path="/about">
          <ProtectedLayout><About /></ProtectedLayout>
        </Route>
        <Route path="/privacy-policy">
          <ProtectedLayout><PrivacyPolicy /></ProtectedLayout>
        </Route>
        <Route path="/terms">
          <ProtectedLayout><Terms /></ProtectedLayout>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <AdminRoute><AdminDashboard /></AdminRoute>
        </Route>
        <Route path="/admin/users">
          <AdminRoute><AdminUsers /></AdminRoute>
        </Route>
        <Route path="/admin/levels">
          <AdminRoute><AdminLevels /></AdminRoute>
        </Route>
        <Route path="/admin/branches">
          <AdminRoute><AdminBranches /></AdminRoute>
        </Route>
        <Route path="/admin/subjects">
          <AdminRoute><AdminSubjects /></AdminRoute>
        </Route>
        <Route path="/admin/lessons">
          <AdminRoute><AdminLessons /></AdminRoute>
        </Route>
        <Route path="/admin/exams">
          <AdminRoute><AdminExams /></AdminRoute>
        </Route>
        <Route path="/admin/tests">
          <AdminRoute><AdminTests /></AdminRoute>
        </Route>
        <Route path="/admin/baccalaureates">
          <AdminRoute><AdminBaccalaureates /></AdminRoute>
        </Route>
        <Route path="/admin/review-channels">
          <AdminRoute><AdminReviewChannels /></AdminRoute>
        </Route>
        <Route path="/admin/announcements">
          <AdminRoute><AdminAnnouncements /></AdminRoute>
        </Route>
        <Route path="/admin/notifications">
          <AdminRoute><AdminNotifications /></AdminRoute>
        </Route>
        <Route path="/admin/language-settings">
          <AdminRoute><AdminLanguageSettings /></AdminRoute>
        </Route>
        <Route path="/admin/backup">
          <AdminRoute><AdminBackup /></AdminRoute>
        </Route>
        <Route path="/admin/audit-logs">
          <AdminRoute><AdminAuditLogs /></AdminRoute>
        </Route>
        <Route path="/admin/homework">
          <AdminRoute><AdminHomework /></AdminRoute>
        </Route>
        <Route path="/favorites">
          <ProtectedRoute><Favorites /></ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="djadi-theme">
      <LanguageProvider>
        <NotificationsProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </NotificationsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
