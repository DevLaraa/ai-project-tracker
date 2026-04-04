import { useCallback, useEffect, useMemo, useState } from "react";
import { getProjects, createProject } from "../api/projects";
import { logout } from "../api/auth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  generateAndCreateTasksWithAI,
} from "../api/tasks";

type Project = {
  id: string;
  name: string;
  description?: string;
};

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState<"todo" | "in_progress" | "done">("todo");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiTaskCount, setAiTaskCount] = useState(5);

  const fetchProjects = useCallback(async () => {
    const data = await getProjects();
    setProjects(data);

    if (data.length > 0 && !selectedProject) {
      setSelectedProject(data[0]);
    }
  }, [selectedProject]);

  const fetchTasks = useCallback(async (projectId: string) => {
    const data = await getTasks(projectId);
    setTasks(data);
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProject) {
      void fetchTasks(selectedProject.id);
    }
  }, [fetchTasks, selectedProject]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    await createProject({
      name: projectName,
      description: projectDesc,
    });

    setProjectName("");
    setProjectDesc("");
    await fetchProjects();
  };

  const handleCreateTask = async () => {
    if (!selectedProject || !taskTitle.trim()) return;

    await createTask({
      projectId: selectedProject.id,
      title: taskTitle,
      status: taskStatus,
    });

    setTaskTitle("");
    setTaskStatus("todo");
    await fetchTasks(selectedProject.id);
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: "todo" | "in_progress" | "done"
  ) => {
    await updateTask(taskId, { status: newStatus });

    if (selectedProject) {
      await fetchTasks(selectedProject.id);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);

    if (selectedProject) {
      await fetchTasks(selectedProject.id);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleGenerateTasks = async () => {
    if (!selectedProject) return;

    setAiLoading(true);

    try {
      await generateAndCreateTasksWithAI({
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        projectDescription: selectedProject.description,
        taskCount: aiTaskCount,
      });

      await fetchTasks(selectedProject.id);
    } catch (error) {
      console.error(error);
      alert("Failed to generate tasks with AI");
    } finally {
      setAiLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((task) => task.status === "todo").length;
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const done = tasks.filter((task) => task.status === "done").length;

    return { total, todo, inProgress, done };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              AI Project Tracker
            </p>
            <h2 className="mt-2 text-2xl font-bold text-black">Workspace</h2>
            <p className="mt-1 text-sm text-slate-500">
              Organize projects, tasks and AI-generated planning.
            </p>
          </div>

          <div className="p-6 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Create Project</h3>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                placeholder="Description"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />

              <button
                onClick={handleCreateProject}
                className="w-full rounded-xl bg-purple-600 px-4 py-3 text-white font-medium transition hover:bg-purple-700"
              >
                + Create Project
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedProject?.id === project.id
                    ? "border-purple-200 bg-purple-50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="font-semibold text-slate-900">{project.name}</p>
                {project.description ? (
                  <p className="mt-1 text-sm text-slate-500 truncate">
                    {project.description}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">No description</p>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-red-500 px-4 py-3 text-white font-medium transition hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Current project</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-black">
                  {selectedProject?.name || "Select a project"}
                </h1>
                <p className="mt-2 text-slate-500 max-w-2xl">
                  {selectedProject?.description || "Choose a project from the sidebar to manage its tasks."}
                </p>
              </div>

              {selectedProject && (
                <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 p-2 shadow-sm">
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                    value={aiTaskCount}
                    onChange={(e) => setAiTaskCount(Number(e.target.value))}
                  >
                    <option value={3}>3 tasks</option>
                    <option value={5}>5 tasks</option>
                    <option value={8}>8 tasks</option>
                  </select>

                  <button
                    onClick={handleGenerateTasks}
                    disabled={aiLoading}
                    className="rounded-xl bg-black px-4 py-2 text-white font-medium transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {aiLoading ? "Generating..." : "Generate Tasks with AI"}
                  </button>
                </div>
              )}
            </section>

            {selectedProject && (
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Total tasks</p>
                  <p className="mt-2 text-3xl font-bold">{stats.total}</p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Todo</p>
                  <p className="mt-2 text-3xl font-bold">{stats.todo}</p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <p className="text-sm text-slate-500">In progress</p>
                  <p className="mt-2 text-3xl font-bold">{stats.inProgress}</p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Done</p>
                  <p className="mt-2 text-3xl font-bold">{stats.done}</p>
                </div>
              </section>
            )}

            {selectedProject && (
              <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Create Task</h3>

                <div className="flex flex-col lg:flex-row gap-3">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200 bg-white"
                    placeholder="New task..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />

                  <select
                    className="rounded-xl border border-slate-200 px-3 py-3 bg-white outline-none"
                    value={taskStatus}
                    onChange={(e) =>
                      setTaskStatus(e.target.value as "todo" | "in_progress" | "done")
                    }
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>

                  <button
                    onClick={handleCreateTask}
                    className="rounded-xl bg-green-500 px-5 py-3 text-white font-medium transition hover:bg-green-600"
                  >
                    Add Task
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tasks</h3>
                {selectedProject && (
                  <span className="text-sm text-slate-500">{tasks.length} items</span>
                )}
              </div>

              {!selectedProject ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                  Select a project to view its tasks.
                </div>
              ) : tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                  No tasks yet. Create one manually or generate them with AI.
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-medium">{task.title}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as "todo" | "in_progress" | "done"
                            )
                          }
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>

                        <span
                          className={`rounded-xl px-3 py-2 text-xs font-medium ${
                            task.status === "todo"
                              ? "bg-slate-200 text-slate-700"
                              : task.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.status}
                        </span>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-xl bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}