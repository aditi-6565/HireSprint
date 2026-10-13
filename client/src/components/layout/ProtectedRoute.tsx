import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { UserRole } from 'hiresprint-shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Authenticating HireSprint session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard
    const defaultRoute =
      user.role === 'ADMIN'
        ? '/admin/dashboard'
        : user.role === 'TEACHER'
        ? '/teacher/dashboard'
        : user.role === 'TNP'
        ? '/tnp/dashboard'
        : user.role === 'STUDENT_COORDINATOR'
        ? '/coordinator/dashboard'
        : '/student/dashboard';

    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};
