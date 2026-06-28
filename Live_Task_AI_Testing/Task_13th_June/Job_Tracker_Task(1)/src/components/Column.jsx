import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableJobCard from './SortableJobCard';

export default function Column({ column, jobs, onEdit, onDelete, onArchive, onManageRounds, bulkMode, selectedIds, onToggleSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const dotColor =
    column.id === 'wishlist' ? 'bg-gray-400' :
    column.id === 'applied' ? 'bg-blue-500' :
    column.id === 'follow-up' ? 'bg-yellow-500' :
    column.id === 'interview' ? 'bg-purple-500' :
    column.id === 'offer' ? 'bg-green-500' :
    'bg-red-500';

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 min-w-[20rem] max-w-[20rem] rounded-xl border bg-gray-100 dark:bg-gray-900/60 transition-colors ${
        isOver ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <h2 className="text-sm font-semibold uppercase tracking-wide">{column.label}</h2>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {jobs.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin min-h-[120px]">
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <SortableJobCard
              key={job.id}
              job={job}
              onEdit={() => onEdit(job)}
              onDelete={() => onDelete(job)}
              onArchive={() => onArchive(job)}
              onManageRounds={() => onManageRounds(job)}
              bulkMode={bulkMode}
              selected={selectedIds.has(job.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
