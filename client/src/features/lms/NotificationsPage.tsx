import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = () => {
    api.get('/lms/notifications').then((res) => setNotifications(res.notifications || [])).catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/lms/notifications/${id}/read`);
      loadNotifications();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.post('/lms/notifications/read-all');
      loadNotifications();
    } catch {}
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time updates regarding sessions, evaluations, and assignments
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`flex items-start justify-between rounded-2xl border p-4 transition-all ${
              n.read
                ? 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900'
                : 'border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/60 dark:bg-indigo-950/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  n.read
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <Bell size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                <span className="mt-1 block text-[10px] text-slate-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {!n.read && (
              <button
                onClick={() => markAsRead(n._id)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900"
                title="Mark as read"
              >
                <Check size={16} />
              </button>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            No notifications in your inbox.
          </div>
        )}
      </div>
    </div>
  );
};
