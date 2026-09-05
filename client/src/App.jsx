import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-400 mb-2">
          URLForge
        </h1>
        <p className="text-lg text-slate-300 font-medium mb-6">
          Secure URL Shortener
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Frontend Running (Phase 1 — Project Skeleton)
        </div>
      </div>
    </div>
  );
}

export default App;
