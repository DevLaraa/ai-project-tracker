import type { Project } from '../../types/projects';

type ProjectSidebarProps = {
  projects: Project[];
  selectedProjectId: string | null;
  isProjectsLoading: boolean;
  projectName: string;
  projectDescription: string;
  onProjectNameChange: (value: string) => void;
  onProjectDescriptionChange: (value: string) => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onLogout: () => void;
};

export default function ProjectSidebar({
  projects,
  selectedProjectId,
  isProjectsLoading,
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  onSelectProject,
  onCreateProject,
  onLogout
}: ProjectSidebarProps) {
  return (
    <aside className="flex w-full max-w-sm flex-col border-b border-slate-200/80 bg-[#0f172a] text-slate-100 lg:min-h-screen lg:w-96 lg:max-w-none lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
          Client Project Tracker
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Delivery workspace</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Manage scoped projects, keep work visible, and accelerate planning with AI-assisted task creation.
        </p>
      </div>

      <div className="border-b border-white/10 p-6">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Create project</h2>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Client migration initiative"
              value={projectName}
              onChange={(event) => onProjectNameChange(event.target.value)}
            />
            <textarea
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Short context, outcome, or scope notes"
              value={projectDescription}
              onChange={(event) => onProjectDescriptionChange(event.target.value)}
            />
            <button
              type="button"
              onClick={onCreateProject}
              className="w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Create project
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isProjectsLoading && projects.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            Loading projects...
          </div>
        ) : null}

        {projects.map((project) => {
          const isSelected = selectedProjectId === project.id;

          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelectProject(project.id)}
              className={`w-full rounded-[24px] border p-5 text-left transition ${
                isSelected
                  ? 'border-cyan-300/60 bg-cyan-300/10 shadow-[0_18px_40px_-28px_rgba(34,211,238,0.75)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <p className="text-base font-semibold text-white">{project.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                {project.description || 'No project description yet.'}
              </p>
            </button>
          );
        })}

        {!isProjectsLoading && projects.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300">
            Create your first project to start tracking work.
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-2xl border border-rose-200/20 bg-rose-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
