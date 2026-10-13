import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FileText, BookOpen, ExternalLink, Bookmark, CheckCircle2 } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  useEffect(() => {
    api.get('/lms/resources').then((res) => {
      setResources(res.resources || []);
      if (res.resources?.length > 0) {
        setSelectedResource(res.resources[0]);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Learning & GD Preparation Resources
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Faculty-curated rubrics, discussion frameworks, and placement interview strategies
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List */}
        <div className="space-y-3 lg:col-span-4">
          {resources.map((r) => (
            <div
              key={r._id}
              onClick={() => setSelectedResource(r)}
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
