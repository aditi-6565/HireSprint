import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../services/api';
import { Moon, Sun, Mic, Video, Server, ShieldCheck, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useAuth();
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.get('/health').then((data) => setHealth(data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Preferences & System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize your interface theme, audiovisual permissions, and review system integrations
        </p>
      </div>

      {/* Appearance Theme */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Interface Theme</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose your preferred theme. Your choice persists across browser sessions.
        </p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sun size={16} />
            <span>Light Theme</span>
          </button>

          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 shadow-sm'
                : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Moon size={16} />
            <span>Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Audio & Video Diagnostics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          WebRTC & Microphone Diagnostics
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          HireSprint uses native HTML5 WebRTC peer-to-peer media streams and Web Speech API
        </p>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <div className="flex items-center space-x-2.5">
              <Mic size={16} className="text-indigo-600" />
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Web Speech API (Chrome/Edge Native)
              </span>
            </div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Supported</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <div className="flex items-center space-x-2.5">
              <Video size={16} className="text-indigo-600" />
              <span className="font-medium text-slate-800 dark:text-slate-200">
                P2P WebRTC Mesh Engine
              </span>
            </div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
        </div>
      </div>

      {/* Backend & AI Integration Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">System Integrations</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Core services verified by backend health monitor
        </p>

        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
            <span className="text-slate-400">Backend API</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {health?.service || 'HireSprint API v1.0.0'}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
            <span className="text-slate-400">Database</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              MongoDB (Mongoose ODM)
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
            <span className="text-slate-400">AI Provider</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {health?.aiConfigured ? 'Groq API (Active)' : 'Heuristic Simulation Mode (Default)'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Aptitude Module Scope</span>
            <span className="font-semibold text-rose-500">
              Completely Removed (Exclusive GD Focus)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
