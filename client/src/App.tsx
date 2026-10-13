import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';

import { StudentDashboard } from './features/dashboards/StudentDashboard';
import { AdminDashboard } from './features/dashboards/AdminDashboard';
import { TeacherDashboard } from './features/dashboards/TeacherDashboard';
import { TnpDashboard } from './features/dashboards/TnpDashboard';
import { CoordinatorDashboard } from './features/dashboards/CoordinatorDashboard';

import { AIPracticePage } from './features/ai-practice/AIPracticePage';
import { LiveGDPage } from './features/live-gd/LiveGDPage';
import { TopicsPage } from './features/lms/TopicsPage';
import { ResourcesPage } from './features/lms/ResourcesPage';
import { AssignmentsPage } from './features/lms/AssignmentsPage';
import { NotificationsPage } from './features/lms/NotificationsPage';
import { ProfilePage } from './features/user/ProfilePage';
import { SettingsPage } from './features/user/SettingsPage';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'TNP') return <Navigate to="/tnp/dashboard" replace />;
  if (user.role === 'STUDENT_COORDINATOR') return <Navigate to="/coordinator/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardRedirect />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Five Role Dashboards */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tnp/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TNP', 'ADMIN']}>
                  <TnpDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tnp/reports"
              element={
                <ProtectedRoute allowedRoles={['TNP', 'ADMIN', 'TEACHER']}>
                  <TnpDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT_COORDINATOR', 'ADMIN']}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin User Management */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* AI Practice */}
            <Route path="/gd/practice" element={<AIPracticePage />} />
            <Route path="/gd/practice/:sessionId" element={<AIPracticePage />} />

            {/* Live GD Rooms */}
            <Route path="/gd/live" element={<LiveGDPage />} />
            <Route path="/gd/live/:sessionId" element={<LiveGDPage />} />

            {/* LMS Routes */}
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Profile & Settings */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
