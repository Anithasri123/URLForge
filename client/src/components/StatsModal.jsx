import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function StatsModal({ urlId, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!urlId) return;

    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getUrlStats(urlId);
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch statistics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [urlId]);

  if (!urlId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
          <h3 className="text-xl font-bold text-white">URL Statistics</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading analytics...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
            {error}
          </div>
        ) : stats ? (
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Original URL
              </span>
              <a
                href={stats.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 font-medium hover:underline break-all"
              >
                {stats.originalUrl}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700/50">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Short Code
                </span>
                <span className="font-mono text-white bg-slate-900 px-2.5 py-1 rounded text-xs border border-slate-700">
                  {stats.shortCode}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                    stats.status === 'expired'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {stats.status === 'expired' ? 'Expired' : 'Active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-700/50 text-center">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="block text-2xl font-black text-white">{stats.clickCount}</span>
                <span className="text-xs text-slate-400 font-medium">Total Clicks</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 col-span-2 text-left">
                <div className="text-xs text-slate-400 mb-1">
                  <strong className="text-slate-300">Created:</strong>{' '}
                  {new Date(stats.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Expires:</strong>{' '}
                  {stats.expiresAt
                    ? new Date(stats.expiresAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'No expiration'}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
