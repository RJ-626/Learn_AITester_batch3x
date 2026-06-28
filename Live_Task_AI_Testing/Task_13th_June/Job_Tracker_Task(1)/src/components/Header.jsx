import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, LayoutDashboard, Moon, Sun, Download, Upload, Archive, RotateCcw, RotateCw } from 'lucide-react';

export default function Header({
  search,
  onSearchChange,
  onAdd,
  darkMode,
  onToggleTheme,
  onExport,
  onImport,
  sortOrder,
  onSortChange,
  onOpenDashboard,
  onToggleArchive,
  showArchive,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedCount,
  onClearSelection,
  bulkMode,
  onToggleBulkMode,
  onBulkArchive,
}) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // handled in App
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        onRedo?.();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUndo, onRedo]);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 mr-auto">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          JT
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Job Tracker</h1>
      </div>

      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search company or role... (Ctrl+K)"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {bulkMode && selectedCount > 0 && (
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 text-sm">
          <span className="font-medium text-indigo-700 dark:text-indigo-300">{selectedCount} selected</span>
          <button onClick={onBulkArchive} className="text-xs font-medium text-indigo-600 dark:text-indigo-300 hover:underline">
            Archive
          </button>
          <button onClick={onClearSelection} className="text-xs text-gray-500 hover:underline">
            Clear
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleBulkMode}
          title="Bulk select"
          className={`p-2 rounded-lg border transition text-sm font-medium ${
            bulkMode
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 transition ${
            canUndo ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 transition ${
            canRedo ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenDashboard}
          title="Analytics Dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <button
          onClick={onToggleArchive}
          title={showArchive ? 'Hide Archive' : 'Show Archive'}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${
            showArchive
              ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span className="hidden sm:inline">{showArchive ? 'Active' : 'Archive'}</span>
        </button>

        <button
          onClick={() => onSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
          title={`Sort: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {sortOrder === 'newest' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h5M3 16h1M17 4v16m0 0l-4-4m4 4l4-4" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h1M3 8h5M3 12h9M3 16h13M17 20V4m0 0l-4 4m4-4l4 4" />
            )}
          </svg>
          <span className="hidden sm:inline">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <label
          title="Import JSON"
          className="cursor-pointer p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition inline-flex items-center"
        >
          <Upload className="w-4 h-4" />
          <input type="file" accept="application/json" onChange={onImport} className="hidden" />
        </label>

        <button
          onClick={onExport}
          title="Export JSON"
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </button>
      </div>
    </header>
  );
}
