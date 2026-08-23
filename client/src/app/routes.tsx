import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ErrorPage } from '../components/ErrorPage';
import { Shell } from '../components/layout/Shell';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import HomePage from '../pages/HomePage';
import HardwareDashboardPage from '../features/hardware/pages/HardwareDashboardPage';
import HardwareBrowsePage from '../features/hardware/pages/HardwareBrowsePage';
import { useAuth } from './providers';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public layout (no sidebar)
function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

// Hardware route - shows different page based on role
function HardwareRoute() {
  const { user } = useAuth();
  const isOrganizer = user?.global_role === 'admin'; // Simplified - in real app check event membership

  return isOrganizer ? <HardwareDashboardPage eventId="e0000000-0000-0000-0000-000000000001" /> : <HardwareBrowsePage eventId="e0000000-0000-0000-0000-000000000001" />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <ErrorPage notFound /> },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
    ],
  },
  {
    element: <Shell />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'hardware',
        element: (
          <ProtectedRoute>
            <HardwareRoute />
          </ProtectedRoute>
        ),
      },
      {
        path: 'venue',
        element: (
          <ProtectedRoute>
            <div>Venue Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects',
        element: (
          <ProtectedRoute>
            <div>Projects Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'judging',
        element: (
          <ProtectedRoute>
            <div>Judging Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'team',
        element: (
          <ProtectedRoute>
            <div>Team Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'events',
        element: (
          <ProtectedRoute>
            <div>Events Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkin',
        element: (
          <ProtectedRoute>
            <div>Check-in Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'budget',
        element: (
          <ProtectedRoute>
            <div>Budget Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'incidents',
        element: (
          <ProtectedRoute>
            <div>Incidents Dashboard - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);