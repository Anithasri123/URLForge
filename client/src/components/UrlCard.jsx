import React, { useState } from 'react';

export default function UrlCard({ url, onDelete, onShowStats }) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(url.id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);

  return (
    <div className="bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 rounded-xl p-5 transition-all shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* URL Content */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-extrabold text-indigo-400 hover:text-indigo-300 font-mono tracking-tight"
            >
              {url.shortUrl}
            </a>

            {/* Expiration Status Badge */}
            {isExpired ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Expired
              </span>
            ) : url.expiresAt ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Expires: {new Date(url.expiresAt).toLocaleDateString()}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-700/60 text-slate-400 border border-slate-700">
                No expiration
              </span>
            )}
          </div>

          {/* Original URL */}
          <p className="text-xs text-slate-400 truncate max-w-xl" title={url.originalUrl}>
            <span className="text-slate-500 mr-1 font-medium">Destination:</span>
            {url.originalUrl}
          </p>

          {/* Metadata Footer */}
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <span>
              Created: {new Date(url.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-300">
              {url.clickCount} {url.clickCount === 1 ? 'click' : 'clicks'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-700/50">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              copied
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-slate-200'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={() => onShowStats(url.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            Stats
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 text-slate-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
