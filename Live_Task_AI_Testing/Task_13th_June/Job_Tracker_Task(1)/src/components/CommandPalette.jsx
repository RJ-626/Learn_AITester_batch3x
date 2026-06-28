import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ExternalLink, Pencil, Trash2, LayoutDashboard, Moon, Sun, Archive, Plus, BarChart3 } from 'lucide-react';

export default function CommandPalette({ jobs, onClose, onEdit, onDelete, onArchive, onAdd, onOpenDashboard, darkMode, onToggleTheme, showArchive, onToggleArchive }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return jobs
      .filter((j) =>
        (j.company || '').toLowerCase().includes(term) ||
        (j.role || '').toLowerCase().includes(term) ||
        (j.notes || '').toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [jobs, query]);

  const actions = [
    { id: 'add', label: 'Add New Job', icon: Plus, shortcut: 'N', onClick: () => { onClose(); onAdd(); } },
    { id: 'dashboard', label: 'Open Dashboard', icon: BarChart3, shortcut: 'D', onClick: () => { onClose(); onOpenDashboard(); } },
    { id: 'theme', label: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: darkMode ? Sun : Moon, shortcut: 'T', onClick: () => { onToggleTheme(); } },
    { id: 'archive', label: showArchive ? 'Show Active Jobs' : 'Show Archive', icon: Archive, shortcut: 'A', onClick: () => { onToggleArchive(); } },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs or run commands..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500">
            ESC
          </kbd>
        </div>

        {results.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Jobs</div>
            {results.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                onClick={() => {
                  onClose();
                  onEdit(job);
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{job.company} — {job.role}</div>
                  <div className="text-xs text-gray-500 truncate">{job.status}</div>
                </div>
                <div className="flex items-center gap-1">
                  {job.linkedin && (
                    <a
                      href={job.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
                      title="Open LinkedIn"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</div>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{action.label}</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500">
                {action.shortcut}
              </kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
