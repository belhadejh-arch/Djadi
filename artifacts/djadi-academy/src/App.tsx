import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';

// Layout & Auth
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/protected-route';

// Pages
import Splash from '@/pages/splash';
import Login from '@/pages/login';
import Register from '@/pages/register';
import GradeSelect from '@/pages/grade-select';
import Dashboard from '@/pages/dashboard';
import Subjects from '@/pages/subjects';
import SubjectDetail from '@/pages/subject-detail';
import Lessons from '@/pages/lessons';
import LessonDetail from '@/pages/lesson-detail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/grade-select">
        <ProtectedRoute>
          <GradeSelect />
        </ProtectedRoute>
      </Route>

      {/* Protected Routes with Layout */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/subjects">
        <ProtectedRoute>
          <AppLayout>
            <Subjects />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/subjects/:id">
        <ProtectedRoute>
          <AppLayout>
            <SubjectDetail />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/lessons">
        <ProtectedRoute>
          <AppLayout>
            <Lessons />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/lessons/:id">
        <ProtectedRoute>
          <AppLayout>
            <LessonDetail />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="djadi-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
