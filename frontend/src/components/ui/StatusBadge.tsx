import type { TaskStatus } from '../../types/tasks';

const badgeByStatus: Record<TaskStatus, string> = {
  todo: 'bg-slate-200 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-800',
  done: 'bg-emerald-100 text-emerald-800'
};

const labelByStatus: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In progress',
  done: 'Done'
};

type StatusBadgeProps = {
  status: TaskStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeByStatus[status]}`}>
      {labelByStatus[status]}
    </span>
  );
}
