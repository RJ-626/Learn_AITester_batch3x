import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';

import { getAllJobs, addJob, updateJob, deleteJob, COLUMNS } from './db';
import Header from './components/Header';
import Column from './components/Column';
import JobModal from './components/JobModal';
import DeleteConfirm from './components/DeleteConfirm';
import SortableJobCard from './components/SortableJobCard';
import JobCard from './components/JobCard';
import CommandPalette from './components/CommandPalette';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import InterviewRoundModal from './components/InterviewRoundModal';

function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [showArchive, setShowArchive] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [roundModalJob, setRoundModalJob] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(null);

  // Undo/Redo history
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryAction = useRef(false);

  const pushHistory = useCallback((nextJobs) => {
    if (isHistoryAction.current) {
      isHistoryAction.current = false;
      return;
    }
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, nextJobs];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex >= 0 && historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    isHistoryAction.current = true;
    const idx = historyIndex - 1;
    const snapshot = history[idx];
    setHistoryIndex(idx);
    setJobs(snapshot);
    // Also sync to DB one by one (best effort)
    snapshot.forEach((j) => updateJob(j));
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    isHistoryAction.current = true;
    const idx = historyIndex + 1;
    const snapshot = history[idx];
    setHistoryIndex(idx);
    setJobs(snapshot);
    snapshot.forEach((j) => updateJob(j));
  }, [canRedo, history, historyIndex]);

  useEffect(() => {
    getAllJobs().then((data) => {
      setJobs(data);
      setHistory([data]);
      setHistoryIndex(0);
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = e.target.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          handleAdd();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeJobs = useMemo(() => jobs.filter((j) => !j.archived), [jobs]);
  const archivedJobs = useMemo(() => jobs.filter((j) => j.archived), [jobs]);

  const filteredJobs = useMemo(() => {
    const pool = showArchive ? archivedJobs : activeJobs;
    const term = search.trim().toLowerCase();
    if (!term) return pool;
    return pool.filter(
      (j) =>
        (j.company || '').toLowerCase().includes(term) ||
        (j.role || '').toLowerCase().includes(term)
    );
  }, [jobs, search, showArchive]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeJob = jobs.find((j) => j.id === active.id);
    if (!activeJob || activeJob.archived) return;

    const overId = over.id;
    const isOverColumn = COLUMNS.some((c) => c.id === overId);

    let targetStatus = null;
    if (isOverColumn) {
      targetStatus = overId;
    } else {
      const overJob = jobs.find((j) => j.id === overId);
      if (overJob) targetStatus = overJob.status;
    }

    if (targetStatus && activeJob.status !== targetStatus) {
      const updated = { ...activeJob, status: targetStatus };
      await updateJob(updated);
      const next = jobs.map((j) => (j.id === updated.id ? updated : j));
      setJobs(next);
      pushHistory(next);
    }
  };

  const handleAdd = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const checkDuplicate = (jobData, excludeId) => {
    const term = `${jobData.company.trim().toLowerCase()}|${jobData.role.trim().toLowerCase()}`;
    return jobs.find((j) => {
      if (excludeId && j.id === excludeId) return false;
      const existing = `${(j.company || '').toLowerCase()}|${(j.role || '').toLowerCase()}`;
      return existing === term;
    });
  };

  const handleSave = async (jobData) => {
    const dup = checkDuplicate(jobData, editingJob?.id);
    if (dup && !duplicateCheck) {
      setDuplicateCheck({ jobData, dup });
      return;
    }
    setDuplicateCheck(null);

    if (editingJob) {
      const updated = { ...editingJob, ...jobData };
      await updateJob(updated);
      const next = jobs.map((j) => (j.id === updated.id ? updated : j));
      setJobs(next);
      pushHistory(next);
    } else {
      const newJob = await addJob(jobData);
      const next = [...jobs, newJob];
      setJobs(next);
      pushHistory(next);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleDelete = async (id) => {
    await deleteJob(id);
    const next = jobs.filter((j) => j.id !== id);
    setJobs(next);
    pushHistory(next);
    setDeletingJob(null);
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const handleArchive = async (job) => {
    const updated = { ...job, archived: true };
    await updateJob(updated);
    const next = jobs.map((j) => (j.id === updated.id ? updated : j));
    setJobs(next);
    pushHistory(next);
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(job.id);
      return n;
    });
  };

  const handleRestore = async (job) => {
    const updated = { ...job, archived: false };
    await updateJob(updated);
    const next = jobs.map((j) => (j.id === updated.id ? updated : j));
    setJobs(next);
    pushHistory(next);
  };

  const confirmDelete = (job) => {
    setDeletingJob(job);
  };

  const handleExport = () => {
    const data = JSON.stringify(jobs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        const promises = imported.map((j) =>
          addJob({
            company: j.company || '',
            role: j.role || '',
            linkedin: j.linkedin || '',
            resume: j.resume || '',
            date: j.date || new Date().toISOString().split('T')[0],
            salary: j.salary || '',
            notes: j.notes || '',
            status: j.status || 'wishlist',
            interviewRounds: j.interviewRounds || [],
          })
        );
        const newJobs = await Promise.all(promises);
        const next = [...jobs, ...newJobs];
        setJobs(next);
        pushHistory(next);
      } catch (err) {
        alert('Failed to import JSON. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveRounds = async (updatedJob) => {
    await updateJob(updatedJob);
    const next = jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j));
    setJobs(next);
    pushHistory(next);
    setRoundModalJob(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkArchive = async () => {
    const updates = [];
    const next = jobs.map((j) => {
      if (selectedIds.has(j.id)) {
        const u = { ...j, archived: true };
        updates.push(u);
        return u;
      }
      return j;
    });
    await Promise.all(updates.map((u) => updateJob(u)));
    setJobs(next);
    pushHistory(next);
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const activeJob = activeId ? jobs.find((j) => j.id === activeId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Header
        search={search}
        onSearchChange={setSearch}
        onAdd={handleAdd}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((d) => !d)}
        onExport={handleExport}
        onImport={handleImport}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onOpenDashboard={() => setShowDashboard(true)}
        onToggleArchive={() => { setShowArchive((v) => !v); setSelectedIds(new Set()); }}
        showArchive={showArchive}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        bulkMode={bulkMode}
        onToggleBulkMode={() => { setBulkMode((v) => !v); setSelectedIds(new Set()); }}
        onBulkArchive={handleBulkArchive}
      />

      {showArchive && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>Showing archived jobs. These are hidden from the main board.</span>
          <button onClick={() => setShowArchive(false)} className="font-medium hover:underline">Back to Active</button>
        </div>
      )}

      <main className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
        {showArchive ? (
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((col) => {
              const colJobs = filteredJobs
                .filter((j) => j.status === col.id)
                .sort((a, b) => {
                  const da = new Date(a.date || 0).getTime();
                  const db = new Date(b.date || 0).getTime();
                  return sortOrder === 'newest' ? db - da : da - db;
                });
              return (
                <Column
                  key={col.id}
                  column={col}
                  jobs={colJobs}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                  onArchive={handleRestore}
                  onManageRounds={setRoundModalJob}
                  bulkMode={false}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              );
            })}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full min-w-max">
              {COLUMNS.map((col) => {
                const colJobs = filteredJobs
                  .filter((j) => j.status === col.id)
                  .sort((a, b) => {
                    const da = new Date(a.date || 0).getTime();
                    const db = new Date(b.date || 0).getTime();
                    return sortOrder === 'newest' ? db - da : da - db;
                  });
                return (
                  <Column
                    key={col.id}
                    column={col}
                    jobs={colJobs}
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                    onArchive={handleArchive}
                    onManageRounds={setRoundModalJob}
                    bulkMode={bulkMode}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                  />
                );
              })}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeJob ? <JobCard job={activeJob} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {isModalOpen && (
        <JobModal
          job={editingJob}
          onClose={() => {
            setIsModalOpen(false);
            setEditingJob(null);
            setDuplicateCheck(null);
          }}
          onSave={handleSave}
          existingResumes={Array.from(new Set(jobs.map((j) => j.resume).filter(Boolean)))}
        />
      )}

      {duplicateCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-base font-semibold mb-2">Duplicate Detected</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              A job for <span className="font-medium">{duplicateCheck.dup.company}</span> as{' '}
              <span className="font-medium">{duplicateCheck.dup.role}</span> already exists.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDuplicateCheck(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(duplicateCheck.jobData)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
              >
                Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingJob && (
        <DeleteConfirm
          job={deletingJob}
          onCancel={() => setDeletingJob(null)}
          onConfirm={() => handleDelete(deletingJob.id)}
        />
      )}

      {commandOpen && (
        <CommandPalette
          jobs={activeJobs}
          onClose={() => setCommandOpen(false)}
          onEdit={(job) => { setCommandOpen(false); handleEdit(job); }}
          onArchive={(job) => { setCommandOpen(false); handleArchive(job); }}
          onAdd={handleAdd}
          onOpenDashboard={() => { setCommandOpen(false); setShowDashboard(true); }}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((d) => !d)}
          showArchive={showArchive}
          onToggleArchive={() => setShowArchive((v) => !v)}
        />
      )}

      {showDashboard && (
        <AnalyticsDashboard jobs={jobs} onClose={() => setShowDashboard(false)} />
      )}

      {roundModalJob && (
        <InterviewRoundModal
          job={roundModalJob}
          onClose={() => setRoundModalJob(null)}
          onSave={handleSaveRounds}
        />
      )}
    </div>
  );
}

export default App;
