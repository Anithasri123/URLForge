import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import UrlForm from '../components/UrlForm';
import UrlList from '../components/UrlList';
import StatsModal from '../components/StatsModal';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatsId, setSelectedStatsId] = useState(null);

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUrls();
      setUrls(data.urls || []);
    } catch (err) {
      console.error('Failed to fetch URLs:', err.message);
      setError(err.message || 'Failed to load URLs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleUrlCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleDeleteUrl = async (id) => {
    await api.deleteUrl(id);
    setUrls((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">URL Management Dashboard</h2>
          <p className="text-sm text-slate-400">Create, manage, and view simple analytics for your links</p>
        </div>
      </div>

      {/* URL Creation Form */}
      <UrlForm onUrlCreated={handleUrlCreated} />

      {/* URL List */}
      <UrlList
        urls={urls}
        loading={loading}
        error={error}
        onDeleteUrl={handleDeleteUrl}
        onShowStats={(id) => setSelectedStatsId(id)}
      />

      {/* Stats Modal */}
      {selectedStatsId && (
        <StatsModal
          urlId={selectedStatsId}
          onClose={() => setSelectedStatsId(null)}
        />
      )}
    </main>
  );
}
