import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Video, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CoordinatorSessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/gd/sessions?type=LIVE_GD').then((res) => setSessions(res.sessions || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assigned GD Sessions & Schedules
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor, coordinate, and launch live student GD meeting rooms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <div
            key={s._id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {s.sessionType}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{s.durationMinutes || 15}m</span>
                </span>
              </div>
              <h3 className="mt-3 font-bold text-sm text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Topic: {s.topicTitle || 'General Placement GD'}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Users size={14} />
                <span>Status: {s.status}</span>
              </span>
              <button
                onClick={() => navigate(`/gd/live/${s._id}`)}
                className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all"
              >
                <Video size={14} />
                <span>Launch Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {sessions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-400">No active live GD sessions found. Faculty creates sessions from their studio.</p>
        </div>
      )}
    </div>
  );
};

export const CoordinatorRosterPage: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    api.get('/lms/attendance').then((res) => setAttendance(res.attendance || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Waiting Room & Participant Rosters
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supervise candidate rosters, admitted attendees, and real-time attendance verification
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Session Attendees</h3>
        <div className="mt-4 space-y-3">
          {attendance.map((a) => (
            <div key={a._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{a.userName}</span>
                <span className="mx-2 text-slate-400">•</span>
                <span className="text-slate-500">{a.userEmail}</span>
              </div>
              <span className="rounded bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Verified Present
              </span>
            </div>
          ))}
          {attendance.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400">No session attendees currently logged.</p>
          )}
        </div>
      </div>
    </div>
  );
};

