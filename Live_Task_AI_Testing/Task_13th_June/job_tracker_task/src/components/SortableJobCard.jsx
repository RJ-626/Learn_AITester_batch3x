import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import JobCard from './JobCard';

export default function SortableJobCard({ job, onEdit, onDelete, onArchive, onManageRounds, bulkMode, selected, onToggleSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCard
        job={job}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={onArchive}
        onManageRounds={onManageRounds}
        bulkMode={bulkMode}
        selected={selected}
        onToggleSelect={onToggleSelect}
      />
    </div>
  );
}
