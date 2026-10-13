import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Video,
  Play,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [duration, setDuration] = useState(15);

  const loadData = () => {
    Promise.all([
      api.get('/gd/sessions?type=LIVE_GD').catch(() => ({ sessions: [] })),
      api.get('/lms/topics').catch(() => ({ topics: [] })),
    ]).then(([s, t]) => {
      setSessions(s.sessions || []);
      setTopics(t.topics || []);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const chosenTopic = topics.find((t) => t._id === topicId);
      await api.post('/gd/sessions', {
        title,
        topicId: topicId || undefined,
        topicTitle: chosenTopic?.title || 'Cohort GD Round',
        sessionType: 'LIVE_GD',
        durationMinutes: duration,
        maxParticipants: 8,
      });
      setShowModal(false);
      setTitle('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Student Coordinator Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            GD Session Management & Coordination
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Facilitate live group discussion meetings, supervise waiting rooms, and track real-time attendance rosters.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          <Plus size={16} />
          <span>Create GD Meeting</span>
        </button>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase">Assigned GDs</span>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{sessions.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase">Active / In Progress</span>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {sessions.filter((s) => s.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase">Approved Topics</span>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{topics.length}</p>
        </div>
      </div>

      {/* Sessions Management Table / Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-slate-900 dark:text-white">Live GD Session Rosters</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage waiting rooms, admit participants, and launch sessions
        </p>

        <div className="mt-4 space-y-3">
          {sessions.map((s) => (
            <div
              key={s._id}
              className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 md:flex-row md:items-center"
            >
              <div>
                <div className="flex items-center space-x-2 text-xs">
                  <span
                    className={`rounded px-2 py-0.5 font-semibold ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="text-slate-400">Duration: {s.durationMinutes} mins</span>
                  <span className="text-slate-400">• Join Code: {s.joinCode}</span>
                </div>
                <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Topic: {s.topicTitle}
                </p>
              </div>

              <div className="mt-3 flex items-center space-x-2 md:mt-0">
                <button
                  onClick={() => navigate(`/gd/live/${s._id}`)}
                  className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  <Video size={14} />
                  <span>Enter / Moderate Meeting</span>
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">
              No live GD meetings currently scheduled. Click "Create GD Meeting" to get started.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Live GD Room</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Room Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Batch B Placement Practice Room"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Topic
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select an approved topic...</option>
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min={5}
                  max={45}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Schedule Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
