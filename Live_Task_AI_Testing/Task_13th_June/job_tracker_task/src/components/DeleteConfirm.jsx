import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirm({ job, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold">Delete Job?</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Are you sure you want to delete the job at{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{job.company}</span> for{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{job.role}</span>? This
          action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
