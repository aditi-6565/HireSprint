import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FileText, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    type: 'guide',
    content: '',
    url: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canCreateResources = ['ADMIN', 'TEACHER', 'TNP'].includes(user?.role || '');

  const loadResources = () => {
    api.get('/lms/resources').then((res) => {
      setResources(res.resources || []);
      if (res.resources?.length > 0) {
        setSelectedResource((current: any) =>
          res.resources.find((resource: any) => resource._id === current?._id) || res.resources[0]
        );
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleCreateResource = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.post('/lms/resources', {
        ...form,
        category: form.category || 'GD Skills',
        content: form.content || undefined,
        url: form.url || undefined,
      });
      setResources((current) => [response.resource, ...current]);
      setSelectedResource(response.resource);
      setForm({ title: '', description: '', category: '', type: 'guide', content: '', url: '' });
      setSuccess('Resource added and published successfully.');
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add this resource.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Learning & GD Preparation Resources
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Faculty-curated rubrics, discussion frameworks, and placement interview strategies
        </p>
        </div>
        {canCreateResources && (
          <button
            type="button"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setError('');
              setSuccess('');
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus size={16} />
            {showCreateForm ? 'Close form' : 'Add LMS Resource'}
          </button>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      {success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{success}</p>}

      {showCreateForm && canCreateResources && (
        <form
          onSubmit={handleCreateResource}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2"
        >
          <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Resource title
            <input
              required
              maxLength={160}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="GD Skills"
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Resource type
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="guide">Guide</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="rubric">Rubric</option>
              <option value="document">Document</option>
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Resource URL (optional)
            <input
              type="url"
              value={form.url}
              onChange={(event) => setForm({ ...form, url: event.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">
            Short description
            <textarea
              required
              maxLength={500}
              rows={2}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">
            Resource content (optional if a URL is provided)
            <textarea
              required={!form.url}
              rows={5}
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Adding resource...' : 'Publish resource'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List */}
        <div className="space-y-3 lg:col-span-4">
          {resources.map((r) => (
            <div
              key={r._id}
              onClick={() => setSelectedResource(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setSelectedResource(r);
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                selectedResource?._id === r._id
                  ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="rounded bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase text-[10px]">
                  {r.type}
                </span>
                <span className="text-slate-400">{r.category}</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                {r.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right Reader Pane */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
          {selectedResource ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {selectedResource.category} • {selectedResource.type}
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedResource.title}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Author: {selectedResource.authorName || 'Placement Cell'}
                </p>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedResource.content || selectedResource.description}
              </div>
              {selectedResource.url && (
                <a
                  href={selectedResource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  <FileText size={16} />
                  Open linked resource
                </a>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a resource to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
