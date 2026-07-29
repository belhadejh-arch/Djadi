import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/lib/language-context';
import { NotificationsProvider } from '@/lib/notifications-context';

// Layout & Auth
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/protected-route';

// Pages
import Splash from '@/pages/splash';
import Login from '@/pages/login';
import Register from '@/pages/register';
import GradeSelect from '@/pages/grade-select';
import BranchSelect from '@/pages/branch-select';
import LanguageSelect from '@/pages/language-select';
import Dashboard from '@/pages/dashboard';
import Subjects from '@/pages/subjects';
import SubjectDetail from '@/pages/subject-detail';
import Lessons from '@/pages/lessons';
import LessonDetail from '@/pages/lesson-detail';
import Baccalaureate from '@/pages/baccalaureate';
import Notifications from '@/pages/notifications';
import GradeCalculator from '@/pages/grade-calculator';
import ScientificCalculator from '@/pages/scientific-calculator';
import ReviewChannels from '@/pages/review-channels';
import Settings from '@/pages/settings';
import About from '@/pages/about';
import PrivacyPolicy from '@/pages/privacy-policy';
import Terms from '@/pages/terms';

// Admin Pages
import { AdminRoute } from '@/components/admin-route';
import AdminDashboard from '@/pages/admin/index';
import AdminUsers from '@/pages/admin/users';
import AdminLevels from '@/pages/admin/levels';
import AdminBranches from '@/pages/admin/branches';
import AdminSubjects from '@/pages/admin/subjects';
import AdminLessons from '@/pages/admin/lessons';
import AdminExams from '@/pages/admin/exams';
import AdminTests from '@/pages/admin/tests';
import AdminBaccalaureates from '@/pages/admin/baccalaureates';
import AdminReviewChannels from '@/pages/admin/review-channels';
import AdminAnnouncements from '@/pages/admin/announcements';
import AdminNotifications from '@/pages/admin/notifications';
import AdminLanguageSettings from '@/pages/admin/language-settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
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

      <Route component={NotFound} />
    </Switch>
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
