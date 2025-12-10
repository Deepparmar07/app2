import type { ReactNode } from 'react';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import RecycleBinPage from './pages/RecycleBinPage';
import SharedLinksPage from './pages/SharedLinksPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import RecentFilesPage from './pages/RecentFilesPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SharedViewPage from './pages/SharedViewPage';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    name: 'Recycle Bin',
    path: '/recycle-bin',
    element: (
      <ProtectedRoute>
        <RecycleBinPage />
      </ProtectedRoute>
    ),
  },
  {
    name: 'Recent Files',
    path: '/recent',
    element: (
      <ProtectedRoute>
        <RecentFilesPage />
      </ProtectedRoute>
    ),
  },
  {
    name: 'Favorites',
    path: '/favorites',
    element: (
      <ProtectedRoute>
        <FavoritesPage />
      </ProtectedRoute>
    ),
  },
  {
    name: 'Shared Links',
    path: '/shared',
    element: (
      <ProtectedRoute>
        <SharedLinksPage />
      </ProtectedRoute>
    ),
  },
  {
    name: 'Admin',
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    name: 'Settings',
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    visible: false,
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    visible: false,
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPasswordPage />,
    visible: false,
  },
  {
    name: 'Shared View',
    path: '/shared/:token',
    element: <SharedViewPage />,
    visible: false,
  },
];

export default routes;
