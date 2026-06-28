import React, { useMemo } from 'react';
import { X, TrendingUp, Clock, Briefcase, Target, Award, Calendar } from 'lucide-react';
import { COLUMNS } from '../db';

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function AnalyticsDashboard({ jobs, onClose }) {
  const stats = useMemo(() => {
    const activeJobs = jobs.filter((j) => !j.archived);
    const total = activeJobs.length;
    const byStatus = {};
    COLUMNS.forEach((c) => (byStatus[c.id] = activeJobs.filter((j) => j.status === c.id).length));

    const applied = byStatus['applied'] || 0;
    const interview = byStatus['interview'] || 0;
    const offer = byStatus['offer'] || 0;
    const rejected = byStatus['rejected'] || 0;

    const responseRate = applied > 0 ? Math.round(((interview + offer + rejected) / applied) * 100) : 0;
    const conversionRate = interview > 0 ? Math.round((offer / interview) * 100) : 0;

    const avgDaysToInterview = (() => {
      const interviewed = activeJobs.filter((j) => j.status === 'interview' && j.date);
      if (interviewed.length === 0) return null;
      const sum = interviewed.reduce((acc, j) => acc + daysSince(j.date), 0);
      return Math.round(sum / interviewed.length);
    })();

    const resumeStats = (() => {
      const map = {};
      activeJobs.forEach((j) => {
        if (!j.resume) return;
        if (!map[j.resume]) map[j.resume] = { total: 0, interview: 0, offer: 0 };
        map[j.resume].total++;
        if (j.status === 'interview' || j.status === 'offer') map[j.resume].interview++;
        if (j.status === 'offer') map[j.resume].offer++;
      });
      return Object.entries(map)
        .map(([name, data]) => ({
          name,
          ...data,
          rate: data.total > 0 ? Math.round((data.interview / data.total) * 100) : 0,
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5);
    })();

    const thisMonth = activeJobs.filter((j) => {
      const d = new Date(j.createdAt || j.date || 0);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, byStatus, responseRate, conversionRate, avgDaysToInterview, resumeStats, thisMonth };
  }, [jobs]);

  const maxCount = Math.max(...COLUMNS.map((c) => stats.byStatus[c.id] || 0), 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold">Analytics Dashboard</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Briefcase} label="Total Jobs" value={stats.total} />
            <StatCard icon={Target} label="Response Rate" value={`${stats.responseRate}%`} />
            <StatCard icon={Award} label="Offer Rate" value={`${stats.conversionRate}%`} />
            <StatCard icon={Calendar} label="This Month" value={stats.thisMonth} />
          </div>

          {/* Pipeline Funnel */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Pipeline Funnel
            </h3>
            <div className="space-y-3">
              {COLUMNS.map((col) => {
                const count = stats.byStatus[col.id] || 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={col.id} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium text-gray-600 dark:text-gray-400 text-right truncate">
                      {col.label}
                    </span>
                    <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor:
                            col.id === 'wishlist'
                              ? '#9ca3af'
                              : col.id === 'applied'
                              ? '#3b82f6'
                              : col.id === 'follow-up'
                              ? '#eab308'
                              : col.id === 'interview'
                              ? '#a855f7'
                              : col.id === 'offer'
                              ? '#22c55e'
                              : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="w-10 text-xs font-semibold text-right">{count}</span>
                    <span className="w-10 text-xs text-gray-400 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resume Performance */}
          {stats.resumeStats.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                Resume Performance
              </h3>
              <div className="space-y-2">
                {stats.resumeStats.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]">{r.name}</span>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{r.interview} interviews / {r.total} apps</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{r.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.avgDaysToInterview !== null && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
              <Clock className="w-4 h-4 text-indigo-500" />
              Average time from Applied to Interview: <span className="font-semibold text-indigo-700 dark:text-indigo-300">{stats.avgDaysToInterview} days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-indigo-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}
