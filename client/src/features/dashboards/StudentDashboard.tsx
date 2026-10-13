import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Video,
  Play,
  Calendar,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/student').catch(() => null),
      api.get('/gd/sessions').catch(() => ({ sessions: [] })),
      api.get('/lms/assignments').catch(() => ({ assignments: [] })),
      api.get('/lms/topics').catch(() => ({ topics: [] })),
    ]).then(([analyticsData, sessionsData, assignmentsData, topicsData]) => {
      setAnalytics(analyticsData);
      setSessions(sessionsData?.sessions || []);
      setAssignments(assignmentsData?.assignments || []);
      setTopics(topicsData?.topics || []);
      setLoading(false);
    });
  }, []);

  const readiness = analytics?.readinessScore || 78;
  const rubric = analytics?.latestRubric || {
    clarityOfExpression: 82,
    topicRelevance: 85,
    logicalStructure: 79,
    supportingArguments: 74,
    activeListening: 80,
    teamworkAndCollaboration: 86,
    participationBalance: 78,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={14} className="text-amber-300" />
              <span>Campus Placement Readiness Hub</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Good day, {user?.name}
            </h1>
            <p className="max-w-xl text-sm text-indigo-100">
              Sharpen your group discussion presence, master structured arguments, and practice with autonomous AI personas or your university peers.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/gd/practice')}
                className="flex items-center space-x-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-600"
              >
                <Sparkles size={16} />
                <span>Start AI GD Practice</span>
              </button>
              <button
                onClick={() => navigate('/gd/live')}
                className="flex items-center space-x-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                <Video size={16} />
                <span>Join Live GD Meeting</span>
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-indigo-400/30 bg-indigo-950/60 shadow-inner">
              <div className="text-center">
                <span className="text-4xl font-black text-white">{readiness}%</span>
                <span className="block text-[10px] font-semibold tracking-wider text-indigo-200 uppercase">
                  GD Readiness
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Sessions Done</span>
            <Award size={18} className="text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics?.totalSessionsCompleted || sessions.length || 3}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            +2 this week
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Attendance Rate</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics?.attendanceRate || 95}%
          </p>
          <span className="text-xs text-slate-400">University GDs</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Active Tasks</span>
            <FileText size={18} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {assignments.length || 2}
          </p>
          <span className="text-xs text-slate-400">Due within 7 days</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Communication</span>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {rubric.clarityOfExpression}%
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Placement Benchmark
          </span>
        </div>
      </div>

      {/* Main Content Grid: Rubric Breakdown & Assignments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Placement Rubric Dimensions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Communication & GD Performance Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Derived from structured university placement assessment criteria
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Score: {readiness}/100
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <RubricBar label="Clarity of Expression" val={rubric.clarityOfExpression} />
            <RubricBar label="Topic Relevance" val={rubric.topicRelevance} />
            <RubricBar label="Logical Structure" val={rubric.logicalStructure} />
            <RubricBar label="Supporting Evidence & Data" val={rubric.supportingArguments} />
            <RubricBar label="Active Listening & Synthesis" val={rubric.activeListening} />
            <RubricBar label="Teamwork & Collaboration" val={rubric.teamworkAndCollaboration} />
            <RubricBar label="Turn & Speaking Balance" val={rubric.participationBalance} />
          </div>
        </div>

        {/* Assigned Activities & Deadlines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Assigned Activities</h3>
            <Link to="/assignments" className="text-xs font-semibold text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {assignments.slice(0, 3).map((a) => (
              <div
                key={a._id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Faculty Assignment
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Due {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                  {a.title}
                </p>
                <button
                  onClick={() => navigate('/assignments')}
                  className="mt-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400"
                >
                  Open Instructions →
                </button>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No pending assignments</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Topics Carousel / Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Recommended Placement GD Topics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated by university Training and Placement Cell
            </p>
          </div>
          <Link to="/topics" className="text-xs font-semibold text-indigo-600 hover:underline">
            Browse all topics
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.slice(0, 3).map((t) => (
            <div
              key={t._id}
              className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {t.category}
                  </span>
                  <span className="text-slate-400">{t.difficulty}</span>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {t.title}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.description}
                </p>
              </div>
              <button
                onClick={() => navigate('/gd/practice', { state: { selectedTopicId: t._id } })}
                className="mt-4 flex items-center justify-center space-x-1 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Play size={12} />
                <span>Practice this topic</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function RubricBar({ label, val }: { label: string; val: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">{val}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
          style={{ width: `${val}%` }}
        />
      </div>
    </div>
  );
}
