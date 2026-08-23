import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import TeamsPage from "../features/teams/TeamsPage";
import ItineraryPage from "../features/itinerary/ItineraryPage";
import CheckinPage from "../features/checkin/CheckinPage";
import CertificatesPage from "../features/certificates/CertificatesPage";
import { useAuth } from "./providers";

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "login",
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: "register",
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "teams",
        element: (
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "itinerary",
        element: (
          <ProtectedRoute>
            <ItineraryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkin",
        element: (
          <ProtectedRoute>
            <CheckinPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "certificates",
        element: (
          <ProtectedRoute>
            <CertificatesPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
