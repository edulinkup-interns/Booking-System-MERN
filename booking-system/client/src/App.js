import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ProvidersPage = lazy(() => import('./pages/ProvidersPage'));
const ProviderDetailPage = lazy(() => import('./pages/ProviderDetailPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const AppointmentDetailPage = lazy(() => import('./pages/AppointmentDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProviderDashboardPage = lazy(() => import('./pages/provider/ProviderDashboardPage'));
const ProviderServicesPage = lazy(() => import('./pages/provider/ProviderServicesPage'));
const ProviderAvailabilityPage = lazy(() => import('./pages/provider/ProviderAvailabilityPage'));
const ProviderAppointmentsPage = lazy(() => import('./pages/provider/ProviderAppointmentsPage'));
const ProviderAnalyticsPage = lazy(() => import('./pages/provider/ProviderAnalyticsPage'));
const ProviderSetupPage = lazy(() => import('./pages/provider/ProviderSetupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                borderRadius: '12px',
                border: '1px solid #334155'
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
            }}
          />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="providers" element={<ProvidersPage />} />
                <Route path="providers/:id" element={<ProviderDetailPage />} />
              </Route>

              {/* Auth */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

              {/* Protected */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="book/:serviceId" element={<BookingPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="appointments/:id" element={<AppointmentDetailPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Provider */}
              <Route path="/provider" element={<PrivateRoute roles={['provider', 'admin']}><Layout /></PrivateRoute>}>
                <Route path="setup" element={<ProviderSetupPage />} />
                <Route path="dashboard" element={<ProviderDashboardPage />} />
                <Route path="services" element={<ProviderServicesPage />} />
                <Route path="availability" element={<ProviderAvailabilityPage />} />
                <Route path="appointments" element={<ProviderAppointmentsPage />} />
                <Route path="analytics" element={<ProviderAnalyticsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
