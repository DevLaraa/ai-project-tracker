import type { TaskStatus } from '../../types/tasks';
import SectionCard from '../ui/SectionCard';

type TaskComposerProps = {
  title: string;
  status: TaskStatus;
  onTitleChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
  onCreateTask: () => void;
};

export default function TaskComposer({
  title,
  status,
  onTitleChange,
  onStatusChange,
  onCreateTask
}: TaskComposerProps) {
  return (
    <SectionCard
      title="Add task"
      description="Capture new work without leaving the delivery view."
    >
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
          placeholder="Define stakeholder interview guide"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />

        <select
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <button
          type="button"
          onClick={onCreateTask}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add task
        </button>
      </div>
    </SectionCard>
  );
}
