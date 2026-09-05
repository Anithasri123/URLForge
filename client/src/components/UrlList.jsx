import React from 'react';
import UrlCard from './UrlCard';

export default function UrlList({ urls, loading, error, onDeleteUrl, onShowStats }) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 text-center text-slate-400 space-y-3">
        <svg className="animate-spin h-7 w-7 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-medium">Loading your URLs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
        {error}
      </div>
    );
  }

  if (!urls || urls.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-700/50 text-slate-400 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-white">No URLs created yet</h4>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Shorten your first destination link using the form above to track clicks and set expiration dates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold text-white">Your Shortened URLs</h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          {urls.length} {urls.length === 1 ? 'URL' : 'URLs'}
        </span>
      </div>

      <div className="space-y-3">
        {urls.map((url) => (
          <UrlCard
            key={url.id}
            url={url}
            onDelete={onDeleteUrl}
            onShowStats={onShowStats}
          />
        ))}
      </div>
    </div>
  );
}
