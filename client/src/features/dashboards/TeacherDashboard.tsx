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
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  // New Topic Form
  const [topicTitle, setTopicTitle] = useState('');
  const [topicCategory, setTopicCategory] = useState('Technology & Society');
  const [topicDifficulty, setTopicDifficulty] = useState('Intermediate');
  const [topicDescription, setTopicDescription] = useState('');

  // New Live Session Form
  const [sessionTitle, setSessionTitle] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [duration, setDuration] = useState(15);

  const loadData = () => {
    Promise.all([
      api.get('/lms/topics').catch(() => ({ topics: [] })),
      api.get('/gd/sessions?type=LIVE_GD').catch(() => ({ sessions: [] })),
      api.get('/lms/assignments').catch(() => ({ assignments: [] })),
      api.get('/lms/attendance').catch(() => ({ attendance: [] })),
    ]).then(([t, s, a, att]) => {
      setTopics(t.topics || []);
      setSessions(s.sessions || []);
      setAssignments(a.assignments || []);
      setAttendance(att.attendance || []);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/lms/topics', {
        title: topicTitle,
        category: topicCategory,
        difficulty: topicDifficulty,
        description: topicDescription,
        learningObjectives: ['Communication fluency', 'Collaborative reasoning'],
      });
      setShowNewTopicModal(false);
      setTopicTitle('');
      setTopicDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const chosenTopic = topics.find((t) => t._id === selectedTopicId);
      await api.post('/gd/sessions', {
        title: sessionTitle || `${chosenTopic?.title || 'Live GD'} - Class Session`,
        topicId: selectedTopicId || undefined,
        topicTitle: chosenTopic?.title || 'Campus Placement GD Round',
        sessionType: 'LIVE_GD',
        durationMinutes: duration,
        maxParticipants: 8,
      });
      setShowNewSessionModal(false);
      setSessionTitle('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Faculty Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Teacher & Mentor Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create GD discussion topics, schedule live cohort sessions, assign activities, and monitor candidate evaluations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowNewTopicModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-700"
          >
            <Plus size={16} />
            <span>Create GD Topic</span>
          </button>
          <button
            onClick={() => setShowNewSessionModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700"
          >
            <Video size={16} />
            <span>Schedule Live GD</span>
          </button>
          <button
            onClick={() => navigate('/resources')}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileText size={16} />
            <span>Add LMS Resource</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase">Published Topics</span>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{topics.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase">Live GD Sessions</span>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{sessions.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase">Class Assignments</span>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{assignments.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase">Logged Attendance</span>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{attendance.length}</p>
        </div>
      </div>

      {/* Topics & Live Sessions 2-Col Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Curated Topics List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Curated Discussion Topics</h3>
            <span className="text-xs font-semibold text-purple-600">{topics.length} active</span>
          </div>

          <div className="mt-4 space-y-3">
            {topics.slice(0, 4).map((t) => (
              <div
                key={t._id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded bg-purple-100 px-2 py-0.5 font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {t.category}
                  </span>
                  <span className="text-slate-400">{t.difficulty}</span>
                </div>
                <h4 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.title}
                </h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live GD Sessions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Scheduled Live GD Meetings</h3>
            <span className="text-xs font-semibold text-indigo-600">{sessions.length} sessions</span>
          </div>

          <div className="mt-4 space-y-3">
            {sessions.slice(0, 4).map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="rounded bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {s.status}
                    </span>
                    <span className="text-slate-400">Max {s.maxParticipants} students</span>
                  </div>
                  <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topic: {s.topicTitle}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/gd/live/${s._id}`)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Enter Room
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">
                No live GD sessions scheduled yet. Click "Schedule Live GD" above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Placement GD Topic
            </h3>
            <form onSubmit={handleCreateTopic} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="e.g. AI In Healthcare: Privacy vs Diagnostic Precision"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-purple-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={topicCategory}
                    onChange={(e) => setTopicCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Technology & Society">Technology & Society</option>
                    <option value="Workplace & Culture">Workplace & Culture</option>
                    <option value="Economy & Energy">Economy & Energy</option>
                    <option value="Ethics & AI">Ethics & AI</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Difficulty
                  </label>
                  <select
                    value={topicDifficulty}
                    onChange={(e) => setTopicDifficulty(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Topic Description & Background
                </label>
                <textarea
                  required
                  rows={3}
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder="Outline key discussion tensions and core premises..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-purple-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
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

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Schedule Live GD Meeting
            </h3>
            <form onSubmit={handleCreateSession} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. CSE 4th Year Placement GD - Round 1"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
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
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Launch Live Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
