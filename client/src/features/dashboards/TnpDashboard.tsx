import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  BarChart3,
  Download,
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Building,
} from 'lucide-react';

export const TnpDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/tnp')
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    try {
      const csvText = await api.get('/analytics/tnp/export-csv');
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hiresprint_placement_gd_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('CSV Export failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & CSV Export */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Training & Placement Cell
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Placement GD & Communication Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cohort-level group discussion intelligence, placement readiness metrics, and student development tracking.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-600/20 transition-all hover:bg-amber-700"
        >
          <FileSpreadsheet size={16} />
          <span>Export Placement Report (CSV)</span>
        </button>
      </div>

      {/* Cohort Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Eligible Students</span>
            <Users size={18} className="text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics?.totalStudents || 120}
          </p>
          <span className="text-xs text-slate-400">Campus Placements 2026</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Average Readiness</span>
            <Award size={18} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics?.avgCohortScore || 78}%
          </p>
          <span className="text-xs text-emerald-600 font-medium">+4% over previous batch</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Completed GDs</span>
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics?.completedSessions || 18}
          </p>
          <span className="text-xs text-slate-400">AI Practice & Live GDs</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Evaluations Stored</span>
            <BarChart3 size={18} className="text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics?.totalEvaluations || 34}
          </p>
          <span className="text-xs text-slate-400">Multi-dimensional Rubrics</span>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Department Performance Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated GD communication benchmarks by engineering division
            </p>
          </div>
          <Building size={20} className="text-slate-400" />
        </div>

        <div className="mt-4 space-y-4">
          {(analytics?.departmentSummary || []).map((dept: any) => (
            <div
              key={dept.department}
              className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 md:flex-row md:items-center"
            >
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{dept.department}</h4>
                <p className="text-xs text-slate-400">
                  {dept.students} Registered Candidates • Participation Rate: {dept.participationRate}
                </p>
              </div>
              <div className="mt-3 flex items-center space-x-4 md:mt-0">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Readiness Avg</span>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {dept.readinessAvg}%
                  </p>
                </div>
                <div className="h-10 w-24 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-600"
                    style={{ width: `${dept.readinessAvg}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates Requiring GD Guidance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-bold text-slate-900 dark:text-white">
            Candidates Recommended for Additional Practice
          </h3>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Students scoring below the 70% placement readiness threshold in recent group discussions.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Aditi Patel</span>
            <p className="text-xs text-slate-400">Average Rubric Score: 68% • 1 session completed</p>
            <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Action: Assigned Practice Round
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Rahul Verma</span>
            <p className="text-xs text-slate-400">Average Rubric Score: 64% • 1 session completed</p>
            <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Action: Focus on Argument Structure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
