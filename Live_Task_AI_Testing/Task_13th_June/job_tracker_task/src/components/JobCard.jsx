import React, { useState, useMemo } from 'react';
import { ExternalLink, Pencil, Trash2, FileText, Calendar, ChevronDown, ChevronUp, AlertCircle, Layers, CheckCircle2, Archive } from 'lucide-react';
import { ROUND_STATUS } from '../db';

const statusBorder = {
  wishlist: 'border-l-gray-400',
  applied: 'border-l-blue-500',
  'follow-up': 'border-l-yellow-500',
  interview: 'border-l-purple-500',
  offer: 'border-l-green-500',
  rejected: 'border-l-red-500',
};

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isStale(job) {
  const days = daysSince(job.date);
  if ((job.status === 'applied' || job.status === 'follow-up') && days >= 7) return true;
  if (job.status === 'interview' && job.interviewRounds?.length) {
    const lastRound = job.interviewRounds[job.interviewRounds.length - 1];
    if (lastRound.status === 'scheduled' && lastRound.date) {
      const roundDays = daysSince(lastRound.date);
      if (roundDays >= 3) return true;
    }
  }
  return false;
}

export default function JobCard({
  job,
  onEdit,
  onDelete,
  onArchive,
  onManageRounds,
  isOverlay,
  bulkMode,
  selected,
  onToggleSelect,
}) {
  const [expanded, setExpanded] = useState(false);
  const days = useMemo(() => daysSince(job.date), [job.date]);
  const stale = useMemo(() => isStale(job), [job]);

  const latestRound = job.interviewRounds?.length
    ? job.interviewRounds[job.interviewRounds.length - 1]
    : null;
  const latestRoundStatus = latestRound
    ? ROUND_STATUS.find((s) => s.id === latestRound.status)
    : null;

  return (
    <div
      className={`relative group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 ${statusBorder[job.status] || 'border-l-gray-400'} border-l-[3px] p-3 shadow-sm hover:shadow-md transition ${
        isOverlay ? 'shadow-xl rotate-2 cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Stale badge */}
      {stale && !isOverlay && (
        <div className="absolute -top-1.5 -right-1.5 z-10">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold shadow-sm">
            <AlertCircle className="w-3 h-3" />
            Follow up
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {bulkMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect?.(job.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
              {job.company}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{job.role}</p>
          </div>
        </div>
        {!isOverlay && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            {job.linkedin && (
              <a
                href={job.linkedin}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
                title="Open LinkedIn"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onManageRounds?.(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${job.interviewRounds?.length ? 'text-purple-500' : 'text-gray-500'}`}
              title="Manage Interview Rounds"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onArchive?.(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-amber-500"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {job.resume && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <FileText className="w-3 h-3" />
            {job.resume}
          </span>
        )}
        {job.date && (
          <span className="inline-flex items-center gap-1" title={job.date}>
            <Calendar className="w-3 h-3" />
            {days === 0 ? 'Today' : `${days}d ago`}
          </span>
        )}
        {job.salary && (
          <span className="text-gray-400 dark:text-gray-500">{job.salary}</span>
        )}
        {latestRound && (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${latestRoundStatus?.color || ''} border-transparent`}>
            <CheckCircle2 className="w-3 h-3" />
            {latestRound.name}: {latestRoundStatus?.label}
          </span>
        )}
      </div>

      {/* Expandable interview rounds mini-view */}
      {job.interviewRounds?.length > 0 && !isOverlay && (
        <div className="mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {job.interviewRounds.length} round{job.interviewRounds.length > 1 ? 's' : ''}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5 pl-1">
              {job.interviewRounds.map((r) => {
                const s = ROUND_STATUS.find((x) => x.id === r.status);
                return (
                  <div key={r.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${
                      r.status === 'passed' ? 'bg-green-500' :
                      r.status === 'failed' ? 'bg-red-500' :
                      r.status === 'scheduled' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{r.name}</span>
                    <span className={`px-1.5 py-0.5 rounded ${s?.color || ''}`}>{s?.label}</span>
                    {r.date && <span className="text-gray-400">{r.date}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes preview */}
      {job.notes && !isOverlay && (
        <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 italic border-t border-gray-100 dark:border-gray-800 pt-1.5">
          {job.notes}
        </div>
      )}
    </div>
  );
}
