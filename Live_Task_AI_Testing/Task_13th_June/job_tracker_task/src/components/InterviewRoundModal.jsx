import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, Calendar, StickyNote } from 'lucide-react';
import { ROUND_TYPES, ROUND_STATUS } from '../db';

export default function InterviewRoundModal({ job, onClose, onSave }) {
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    setRounds(job.interviewRounds || []);
  }, [job]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addRound = () => {
    setRounds((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: 'Technical',
        status: 'scheduled',
        date: '',
        notes: '',
      },
    ]);
  };

  const updateRound = (id, field, value) => {
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRound = (id) => {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    onSave({ ...job, interviewRounds: rounds });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold">Interview Rounds</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{job.company} — {job.role}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {rounds.length === 0 && (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              No interview rounds yet. Add your first round below.
            </div>
          )}

          {rounds.map((round, idx) => (
            <div
              key={round.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Round {idx + 1}</span>
                <button
                  onClick={() => removeRound(round.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={round.name}
                    onChange={(e) => updateRound(round.id, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ROUND_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ROUND_STATUS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => updateRound(round.id, 'status', s.id)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition border ${
                          round.status === s.id
                            ? s.color + ' border-transparent ring-1 ring-indigo-300'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="date"
                      value={round.date}
                      onChange={(e) => updateRound(round.id, 'date', e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
                <div className="relative">
                  <StickyNote className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                  <textarea
                    value={round.notes}
                    onChange={(e) => updateRound(round.id, 'notes', e.target.value)}
                    rows={2}
                    placeholder="Questions asked, feedback, next steps..."
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addRound}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition"
          >
            <Plus className="w-4 h-4" />
            Add Round
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Save Rounds
          </button>
        </div>
      </div>
    </div>
  );
}
