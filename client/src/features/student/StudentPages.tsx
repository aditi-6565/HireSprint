import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Award, CheckCircle2, TrendingUp, Calendar, Clock, Lightbulb } from 'lucide-react';

export const StudentEvaluationsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api.get('/analytics/student').then((res) => setAnalytics(res)).catch(() => {});
  }, []);

  const rubric = analytics?.latestRubric || {
    clarityOfExpression: 82,
    topicRelevance: 85,
    logicalStructure: 78,
    supportingArguments: 75,
    activeListening: 80,
    respectfulDisagreement: 76,
    teamworkAndCollaboration: 84,
    participationBalance: 78,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Evaluation History & Placement Rubrics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review your communication development trends, dimensional scores, and personalized feedback
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Rubric Scores</h3>
          {Object.entries(rubric).map(([key, val]: [string, any]) => {
            if (typeof val !== 'number') return null;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-slate-900 dark:text-white">{val}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${val}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Identified Strengths</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>Consistently maintained professional composure during speaking turns.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>Anchored main thesis around root-cause analysis.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 text-amber-500">
              <Lightbulb size={18} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Next Focus Areas</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>Explicitly reference previous speakers before introducing new arguments.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>Incorporate one concrete data point or case study per statement.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentAttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    api.get('/lms/attendance').then((res) => setAttendance(res.attendance || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My GD Attendance History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personal participation log across faculty and coordinator live GD sessions
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3">Session Date</th>
              <th className="px-6 py-3">Time Joined</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {attendance.map((a) => (
              <tr key={a._id}>
                <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-white">
                  {new Date(a.joinTime).toLocaleDateString()}
                </td>
                <td className="px-6 py-3.5 text-slate-500">
                  {new Date(a.joinTime).toLocaleTimeString()}
                </td>
                <td className="px-6 py-3.5 text-slate-500">
                  {Math.round(a.durationSeconds / 60)} minutes
                </td>
                <td className="px-6 py-3.5">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
            {attendance.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No attendance logs found yet. Join a live GD room to log participation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
