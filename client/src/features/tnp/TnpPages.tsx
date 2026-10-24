import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BarChart3, Building, FileSpreadsheet, Download, Users, AlertTriangle, TrendingUp } from 'lucide-react';

export const TnpDepartmentsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api.get('/analytics/tnp').then((res) => setAnalytics(res)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Department & Branch GD Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Comparative group discussion communication metrics across engineering departments
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(analytics?.departmentSummary || [
          { department: 'Computer Science & Engineering', students: 120, readinessAvg: 80, participationRate: '88%' },
          { department: 'Information Technology', students: 48, readinessAvg: 77, participationRate: '84%' },
          { department: 'Electronics & Communication', students: 56, readinessAvg: 73, participationRate: '79%' },
        ]).map((d: any) => (
          <div key={d.department} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="font-bold text-sm text-slate-900 dark:text-white">{d.department}</span>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{d.readinessAvg}%</span>
              <span className="text-xs text-slate-400">{d.students} Students</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${d.readinessAvg}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Participation: {d.participationRate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TnpOversightPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          GD Practice Oversight & Support List
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Identify candidates needing extra coaching before placement interview panels
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Candidates Flagged for Remedial Practice</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">Aditi Patel (CSE)</span>
              <p className="text-xs text-slate-500">Recent Average Score: 68% • Completed 1 practice session</p>
            </div>
            <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Assigned 3 Practice Rounds
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">Rahul Verma (CSE)</span>
              <p className="text-xs text-slate-500">Recent Average Score: 64% • Low evidence-backing score</p>
            </div>
            <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Needs Structured Practice
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TnpExportPage: React.FC = () => {
  const handleDownload = async () => {
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
      alert(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Export Placement GD Data
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate comprehensive CSV spreadsheet reports for institutional placement records
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-3 text-amber-600">
          <FileSpreadsheet size={28} />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Complete Placement CSV Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Includes candidate names, topics, 8 rubric dimensions, and overall scores.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-amber-700"
        >
          <Download size={16} />
          <span>Download Placement Report (CSV)</span>
        </button>
      </div>
    </div>
  );
};
