import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  BookOpen,
  Calendar,
  BookmarkCheck,
  Video,
  Plus,
  CheckCircle2,
  Users,
  Award,
  Clock,
  Trash2,
  FileText,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. TEACHER TOPICS STUDIO
export const TeacherTopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology & Society');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [description, setDescription] = useState('');

  const loadTopics = () => {
    api.get('/lms/topics').then((res) => setTopics(res.topics || [])).catch(() => {});
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/lms/topics', {
        title,
        category,
        difficulty,
        description,
        learningObjectives: ['Structured reasoning', 'Fluency under pressure', 'Evidence-based support'],
        rules: ['45 seconds per initial turn', 'Synthesize opposing viewpoints'],
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadTopics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this GD topic?')) {
      try {
        await api.delete(`/lms/topics/${id}`);
        loadTopics();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Topic Management Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Author and publish university group discussion topics, learning objectives, and rubrics
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-700"
        >
          <Plus size={16} />
          <span>New GD Topic</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <div
            key={t._id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="rounded bg-purple-50 px-2 py-0.5 font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  {t.category}
                </span>
                <span className="text-slate-400">{t.difficulty}</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{t.title}</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-3 dark:text-slate-400">
                {t.description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <span className="text-emerald-600 font-semibold">Published</span>
              <button
                onClick={() => handleDelete(t._id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                title="Delete Topic"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Topic</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clean Energy Transition in Emerging Markets"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-purple-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Technology & Placement">Technology & Placement</option>
                    <option value="Workplace & Culture">Workplace & Culture</option>
                    <option value="Economy & Energy">Economy & Energy</option>
                    <option value="Ethics & AI">Ethics & AI</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain discussion background and core tradeoffs..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-purple-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. TEACHER SESSIONS SCHEDULER
export const TeacherSessionsPage: React.FC = () => {
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
      const chosen = topics.find((t) => t._id === topicId);
      await api.post('/gd/sessions', {
        title,
        topicId: topicId || undefined,
        topicTitle: chosen?.title || 'Class GD Round',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Live GD Session Scheduler
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Schedule live WebRTC group discussions, assign cohort topics, and enter meeting rooms
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-700"
        >
          <Plus size={16} />
          <span>Schedule New Session</span>
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s._id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center"
          >
            <div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="rounded bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {s.status}
                </span>
                <span className="text-slate-400">Join Code: {s.joinCode}</span>
                <span className="text-slate-400">• Duration: {s.durationMinutes} mins</span>
              </div>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Topic: {s.topicTitle}</p>
            </div>
            <div className="mt-3 flex items-center space-x-3 md:mt-0">
              <button
                onClick={() => navigate(`/gd/live/${s._id}`)}
                className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Video size={14} />
                <span>Launch Meeting Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Live Session</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CSE Final Year GD Cohort A"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Topic</label>
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
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
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. TEACHER ASSIGNMENTS MANAGER
export const TeacherAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadAssignments = () => {
    api.get('/lms/assignments').then((res) => setAssignments(res.assignments || [])).catch(() => {});
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/lms/assignments', {
        title,
        instructions,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      setShowModal(false);
      setTitle('');
      setInstructions('');
      loadAssignments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Class Assignments & Submissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Issue GD practice tasks, set submission deadlines, and review student reflections
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-700"
        >
          <Plus size={16} />
          <span>Publish Assignment</span>
        </button>
      </div>

      <div className="space-y-3">
        {assignments.map((a) => (
          <div
            key={a._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-purple-600 dark:text-purple-400">Active Coursework</span>
              <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
            </div>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{a.title}</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {a.instructions}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish Assignment</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Round 2: Tech Placement GD Self-Reflection"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Instructions</label>
                <textarea
                  required
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Explain requirements, personas to practice with, and expectations..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  Publish & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. TEACHER EVALUATIONS REVIEW
export const TeacherEvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/tnp').then(() => {
      // Fetch recent evaluations
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Candidate Evaluations & Mentor Feedback
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review automated AI rubrics for student participants and provide manual feedback
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Cohort Submissions</h3>
        <p className="text-xs text-slate-400">Evaluations recorded from recent AI practice & Live GD sessions</p>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">Aditi Patel</span>
              <p className="text-xs text-slate-500">Topic: Impact of Generative AI on Engineering Careers</p>
              <div className="mt-1 flex items-center space-x-2 text-xs">
                <span className="font-semibold text-purple-600">Overall Score: 78/100</span>
                <span>• Clarity: 82%</span>
                <span>• Active Listening: 80%</span>
              </div>
            </div>
            <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Evaluated
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">Rahul Verma</span>
              <p className="text-xs text-slate-500">Topic: Remote Work vs Return-to-Office</p>
              <div className="mt-1 flex items-center space-x-2 text-xs">
                <span className="font-semibold text-purple-600">Overall Score: 74/100</span>
                <span>• Clarity: 76%</span>
                <span>• Evidence: 71%</span>
              </div>
            </div>
            <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Evaluated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. TEACHER CLASS ATTENDANCE ROSTER
export const TeacherAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    api.get('/lms/attendance').then((res) => setRecords(res.attendance || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Class GD Attendance Rosters
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Logged join timestamps, duration, and participation presence for institutional compliance
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3">Student Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Join Time</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((r) => (
              <tr key={r._id}>
                <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">{r.userName}</td>
                <td className="px-6 py-3 text-slate-500">{r.userEmail}</td>
                <td className="px-6 py-3 text-slate-500">{new Date(r.joinTime).toLocaleString()}</td>
                <td className="px-6 py-3 text-slate-500">{Math.round(r.durationSeconds / 60)} mins</td>
                <td className="px-6 py-3">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No attendance records recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
