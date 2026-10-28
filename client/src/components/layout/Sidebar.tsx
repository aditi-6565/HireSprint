import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  Video,
  BookOpen,
  FileText,
  BookmarkCheck,
  BarChart3,
  ShieldCheck,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  Building,
  AlertTriangle,
  FileSpreadsheet,
  Server,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Return customized navigation items strictly tailored to each role
  const getNavItemsForRole = () => {
    switch (user?.role) {
      case 'TEACHER':
        return [
          { label: 'Faculty Overview', to: '/teacher/dashboard', icon: LayoutDashboard },
          { label: 'Topic Studio', to: '/teacher/topics', icon: BookOpen },
          { label: 'Session Scheduler', to: '/teacher/sessions', icon: Video },
          { label: 'Assignments & Submissions', to: '/teacher/assignments', icon: BookmarkCheck },
          { label: 'Candidate Evaluations', to: '/teacher/evaluations', icon: Award },
          { label: 'Class Attendance Roster', to: '/teacher/attendance', icon: Clock },
          { label: 'LMS Resources', to: '/resources', icon: FileText },
        ];

      case 'TNP':
        return [
          { label: 'Placement Overview', to: '/tnp/dashboard', icon: LayoutDashboard },
          { label: 'Readiness Analytics', to: '/tnp/reports', icon: BarChart3 },
          { label: 'Department Trends', to: '/tnp/departments', icon: Building },
          { label: 'Practice Oversight', to: '/tnp/oversight', icon: AlertTriangle },
          { label: 'Export Reports (CSV)', to: '/tnp/export', icon: FileSpreadsheet },
          { label: 'Approved GD Topics', to: '/topics', icon: BookOpen },
          { label: 'LMS Resources', to: '/resources', icon: FileText },
        ];

      case 'STUDENT_COORDINATOR':
        return [
          { label: 'Coordinator Overview', to: '/coordinator/dashboard', icon: LayoutDashboard },
          { label: 'Assigned GD Sessions', to: '/coordinator/sessions', icon: Video },
          { label: 'Waiting Room & Rosters', to: '/coordinator/roster', icon: Users },
          { label: 'Live GD Meeting Rooms', to: '/gd/live', icon: Video },
          { label: 'Approved Topics', to: '/topics', icon: BookOpen },
        ];

      case 'ADMIN':
        return [
          { label: 'Admin Overview', to: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'User Directory & Roles', to: '/admin/users', icon: Users },
          { label: 'Topic Governance', to: '/teacher/topics', icon: BookOpen },
          { label: 'Security Audit Logs', to: '/admin/audit-logs', icon: ShieldCheck },
          { label: 'System Health Status', to: '/admin/health', icon: Server },
        ];

      case 'STUDENT':
      default:
        return [
          { label: 'Student Overview', to: '/student/dashboard', icon: LayoutDashboard },
          { label: 'AI GD Practice', to: '/gd/practice', icon: Sparkles, badge: 'AI' },
          { label: 'Live GD Rooms', to: '/gd/live', icon: Video },
          { label: 'GD Topics Catalog', to: '/topics', icon: BookOpen },
          { label: 'Learning Resources', to: '/resources', icon: FileText },
          { label: 'My Course Assignments', to: '/assignments', icon: BookmarkCheck },
          { label: 'My Evaluations & Rubrics', to: '/student/evaluations', icon: Award },
          { label: 'Attendance History', to: '/student/attendance', icon: Clock },
        ];
    }
  };

  const navItems = getNavItemsForRole();

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 font-black text-white shadow-md shadow-indigo-500/20">
            H
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white">
                HireSprint
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {user?.role ? `${user.role} PORTAL` : 'PLACEMENT GD'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {user?.role} Workspace
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              } ${collapsed ? 'justify-center' : 'justify-between'}`
            }
            title={collapsed ? item.label : undefined}
          >
            <div className="flex items-center space-x-3">
              <item.icon
                size={19}
                className="shrink-0 transition-transform group-hover:scale-105"
              />
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && (item as any).badge && (
              <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                {(item as any).badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Nav */}
      <div className="border-t border-slate-200 p-3 space-y-1 dark:border-slate-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
            } ${collapsed ? 'justify-center' : 'space-x-3'}`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};
