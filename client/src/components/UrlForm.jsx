import React, { useState } from 'react';
import { api } from '../services/api';

export default function UrlForm({ onUrlCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setCreatedResult(null);

    const trimmedUrl = originalUrl.trim();
    if (!trimmedUrl) {
      setErrorMessage('Please enter a destination URL.');
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setErrorMessage('Original URL must start with http:// or https://');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await api.createUrl(trimmedUrl, expiresAt ? new Date(expiresAt).toISOString() : null);
      setCreatedResult(data.url);
      setOriginalUrl('');
      setExpiresAt('');
      if (onUrlCreated) {
        onUrlCreated(data.url);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to shorten URL. Please check input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!createdResult?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(createdResult.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Create a Shortened URL</h3>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Destination URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              required
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/products/long-item-name"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Expiration Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Shortening...
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </div>
      </form>

      {/* Success Banner */}
      {createdResult && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Short URL Created Successfully
            </span>
            <a
              href={createdResult.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-extrabold text-white hover:text-emerald-300 underline underline-offset-2 break-all"
            >
              {createdResult.shortUrl}
            </a>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Short URL
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
