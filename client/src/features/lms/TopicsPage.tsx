import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BookOpen, Search, Filter, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopicsPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const loadTopics = () => {
    let url = '/lms/topics?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (difficulty) url += `difficulty=${encodeURIComponent(difficulty)}&`;
    api.get(url).then((res) => setTopics(res.topics || [])).catch(() => {});
  };

  useEffect(() => {
    loadTopics();
  }, [category, difficulty]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Placement GD Topic Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Curated collection of university recruitment discussion topics with objectives and guides
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics by keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadTopics()}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="">All Categories</option>
          <option value="Technology & Placement">Technology & Placement</option>
          <option value="Workplace & Culture">Workplace & Culture</option>
          <option value="Economy & Energy">Economy & Energy</option>
          <option value="Ethics & AI">Ethics & AI</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <button
          onClick={loadTopics}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </div>

      {/* Topic Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <div
            key={t._id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {t.category}
                </span>
                <span className="font-semibold text-slate-400">{t.difficulty}</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {t.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-3 dark:text-slate-400">
                {t.description}
              </p>

              {t.learningObjectives && t.learningObjectives.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Key Objectives:
                  </span>
                  {t.learningObjectives.slice(0, 2).map((obj: string, i: number) => (
                    <div key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span className="line-clamp-1">{obj}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => navigate('/gd/practice', { state: { selectedTopicId: t._id } })}
                className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Play size={14} />
                <span>Practice Topic with AI</span>
              </button>
            </div>
          </div>
        ))}
        {topics.length === 0 && (
          <p className="col-span-3 py-12 text-center text-xs text-slate-400">
            No topics matched your search criteria.
          </p>
        )}
      </div>
    </div>
  );
};
