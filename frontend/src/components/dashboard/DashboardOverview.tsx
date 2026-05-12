type DashboardOverviewProps = {
  projectName: string;
  projectDescription: string;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
};

const stats = [
  { key: 'totalTasks', label: 'Total tasks' },
  { key: 'todoTasks', label: 'Todo' },
  { key: 'inProgressTasks', label: 'In progress' },
  { key: 'doneTasks', label: 'Done' }
] as const;

export default function DashboardOverview({
  projectName,
  projectDescription,
  totalTasks,
  todoTasks,
  inProgressTasks,
  doneTasks
}: DashboardOverviewProps) {
  const values = { totalTasks, todoTasks, inProgressTasks, doneTasks };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
          Current project
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{projectName}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{projectDescription}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="rounded-[24px] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_50px_-36px_rgba(15,23,42,0.45)]"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{values[stat.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
