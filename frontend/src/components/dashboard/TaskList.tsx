import type { Task, TaskStatus } from '../../types/tasks';
import EmptyState from '../ui/EmptyState';
import SectionCard from '../ui/SectionCard';
import StatusBadge from '../ui/StatusBadge';

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  hasProjectSelected: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
};

export default function TaskList({
  tasks,
  isLoading,
  hasProjectSelected,
  onStatusChange,
  onDeleteTask
}: TaskListProps) {
  return (
    <SectionCard
      title="Tasks"
      description={
        hasProjectSelected
          ? 'Keep execution visible with status updates and lightweight task management.'
          : 'Select a project to inspect its task list.'
      }
      action={hasProjectSelected ? <span className="text-sm text-slate-500">{tasks.length} items</span> : null}
    >
      {!hasProjectSelected ? (
        <EmptyState
          title="No project selected"
          description="Choose a project from the left panel to see its delivery backlog."
        />
      ) : isLoading ? (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create tasks manually or use the AI helper to generate an initial plan."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-950">{task.title}</h3>
                <p className="text-sm leading-6 text-slate-500">
                  {task.description || 'No task description provided.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  value={task.status}
                  onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>

                <StatusBadge status={task.status} />

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
