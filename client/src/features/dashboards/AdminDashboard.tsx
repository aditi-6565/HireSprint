import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Users,
  ShieldAlert,
  Server,
  Layers,
  CheckCircle2,
  XCircle,
  Activity,
  Search,
  Filter,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);

  const fetchUsers = () => {
    let url = '/admin/users?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (roleFilter) url += `role=${encodeURIComponent(roleFilter)}&`;
    api.get(url).then((res) => setUsers(res.users || [])).catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      api.get('/analytics/admin').catch(() => null),
      api.get('/admin/users').catch(() => ({ users: [] })),
      api.get('/health').catch(() => null),
    ]).then(([analyticsData, usersData, healthData]) => {
      setAnalytics(analyticsData);
      setUsers(usersData?.users || []);
      setHealth(healthData);
      setLoading(false);
    });
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const rolesCount = analytics?.usersByRole || {};

  return (
    <div className="space-y-8">
      {/* Title & System Status */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            System Administration
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Administrative Control Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage institutional users, role-based authorization, security audit trails, and system integrations.
          </p>
        </div>

        <div className="flex items-center space-x-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-3 w-3 items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Backend API & Socket.IO Healthy
            </p>
            <p className="text-slate-400">
              AI Service: {health?.aiConfigured ? 'Groq Active' : 'Heuristic Simulation Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Role Counts Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <RoleCard role="STUDENT" count={rolesCount.STUDENT || 0} color="border-blue-500" />
        <RoleCard role="TEACHER" count={rolesCount.TEACHER || 0} color="border-purple-500" />
        <RoleCard role="TNP" count={rolesCount.TNP || 0} color="border-amber-500" />
        <RoleCard role="COORDINATOR" count={rolesCount.STUDENT_COORDINATOR || 0} color="border-emerald-500" />
        <RoleCard role="ADMIN" count={rolesCount.ADMIN || 0} color="border-rose-500" />
      </div>

      {/* User Directory Management Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-800 md:flex-row md:items-center">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">User Accounts & RBAC Roles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assign or update privileges securely. Changes take effect on subsequent requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setTimeout(fetchUsers, 50);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="TNP">TnP Cell</option>
              <option value="STUDENT_COORDINATOR">Student Coordinator</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              onClick={fetchUsers}
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Current Role</th>
                <th className="px-6 py-3">Account Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                    {u.departmentName || 'General'}
                  </td>
                  <td className="px-6 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="TNP">TNP</option>
                      <option value="STUDENT_COORDINATOR">STUDENT_COORDINATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-3.5">
                    {u.isActive ? (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 size={12} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        <XCircle size={12} />
                        <span>Deactivated</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleActive(u._id, u.isActive)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        u.isActive
                          ? 'border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40'
                          : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-slate-900 dark:text-white">Recent Security Audit Trail</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable system log of administrative role and permission modifications
        </p>

        <div className="mt-4 space-y-2">
          {analytics?.auditLogs?.map((log: any) => (
            <div
              key={log._id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {log.actorName} ({log.actorEmail})
                </span>
                <span className="mx-2 text-slate-400">•</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {log.action}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {(!analytics?.auditLogs || analytics.auditLogs.length === 0) && (
            <p className="py-4 text-center text-xs text-slate-400">No security audit logs recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

function RoleCard({ role, count, color }: { role: string; count: number; color: string }) {
  return (
    <div className={`rounded-2xl border-l-4 ${color} border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase">{role}</span>
      <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{count}</p>
    </div>
  );
}
