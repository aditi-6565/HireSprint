import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import { BookmarkCheck, Calendar, Clock, CheckCircle2, Send } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/lms/assignments').then((res) => {
      setAssignments(res.assignments || []);
      if (res.assignments?.length > 0) {
        setSelectedAssignment(res.assignments[0]);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);

    try {
      await api.post(`/lms/assignments/${selectedAssignment._id}/submit`, {
        reflectionNotes: notes,
      });
      setSubmitted(true);
      setNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          GD Practice Assignments
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Faculty-issued group discussion tasks, instructions, and reflection submissions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List */}
        <div className="space-y-3 lg:col-span-5">
          {assignments.map((a) => (
            <div
              key={a._id}
              onClick={() => {
                setSelectedAssignment(a);
                setSubmitted(false);
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                selectedAssignment?._id === a._id
                  ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Course Assignment
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar size={13} />
                  <span>Due {new Date(a.dueDate).toLocaleDateString()}</span>
                </span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{a.title}</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                {a.instructions}
              </p>
            </div>
          ))}
          {assignments.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400">No active assignments found.</p>
          )}
        </div>

        {/* Right Details & Submission Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          {selectedAssignment ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400">
                  Due: {new Date(selectedAssignment.dueDate).toLocaleString()}
                </span>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedAssignment.title}
                </h2>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Instructions & Guidelines
                </h4>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedAssignment.instructions}
                </p>
              </div>

              {/* Submission Form */}
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student Self-Reflection & Submission
                </h4>

                {submitted ? (
                  <div className="mt-3 flex items-center space-x-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>Your reflection has been submitted successfully for faculty review.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                    <textarea
                      rows={4}
                      required
                      placeholder="Enter your key takeaways, how you structured your arguments, and your areas of self-identified improvement..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>{submitting ? 'Submitting...' : 'Submit Reflection'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select an assignment to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
