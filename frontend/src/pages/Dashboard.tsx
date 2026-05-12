import { useState } from 'react';
import AiTaskPanel from '../components/dashboard/AiTaskPanel';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import ProjectSidebar from '../components/dashboard/ProjectSidebar';
import TaskComposer from '../components/dashboard/TaskComposer';
import TaskList from '../components/dashboard/TaskList';
import { useDashboardData } from '../hooks/useDashboardData';
import type { TaskStatus } from '../types/tasks';
import { getApiErrorMessage } from '../utils/apiError';

export default function Dashboard() {
  const {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    stats,
    errorMessage,
    isBootstrapping,
    isProjectsLoading,
    isTasksLoading,
    isGeneratingTasks,
    setErrorMessage,
    createNewProject,
    createNewTask,
    updateTaskStatus,
    removeTask,
    generateTasks,
    signOut
  } = useDashboardData();

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [aiTaskCount, setAiTaskCount] = useState(5);

  const handleCreateProject = async () => {
    const normalizedName = projectName.trim();
    const normalizedDescription = projectDescription.trim();

    if (!normalizedName) {
      setErrorMessage('Project name is required.');
      return;
    }

    try {
      setErrorMessage('');
      await createNewProject({
        name: normalizedName,
        description: normalizedDescription || undefined
      });
      setProjectName('');
      setProjectDescription('');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to create the project. Please try again.'));
    }
  };

  const handleCreateTask = async () => {
    if (!selectedProject) {
      setErrorMessage('Select a project before creating a task.');
      return;
    }

    const normalizedTitle = taskTitle.trim();

    if (!normalizedTitle) {
      setErrorMessage('Task title is required.');
      return;
    }

    try {
      setErrorMessage('');
      await createNewTask({
        projectId: selectedProject.id,
        title: normalizedTitle,
        status: taskStatus
      });
      setTaskTitle('');
      setTaskStatus('todo');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to create the task. Please try again.'));
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      setErrorMessage('');
      await updateTaskStatus(taskId, status);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Failed to update the task status. Please try again.')
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setErrorMessage('');
      await removeTask(taskId);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to delete the task. Please try again.'));
    }
  };

  const handleGenerateTasks = async () => {
    if (!selectedProject) {
      setErrorMessage('Select a project before using AI task generation.');
      return;
    }

    await generateTasks(aiTaskCount);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <ProjectSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          isProjectsLoading={isProjectsLoading}
          projectName={projectName}
          projectDescription={projectDescription}
          onProjectNameChange={setProjectName}
          onProjectDescriptionChange={setProjectDescription}
          onSelectProject={setSelectedProjectId}
          onCreateProject={handleCreateProject}
          onLogout={signOut}
        />

        <main className="flex-1 p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl space-y-6">
            {isBootstrapping ? (
              <div className="rounded-[32px] border border-slate-200/70 bg-white/90 px-8 py-16 text-center shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)]">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                  Loading workspace
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  Preparing your project dashboard...
                </h2>
              </div>
            ) : selectedProject ? (
              <>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <DashboardOverview
                    projectName={selectedProject.name}
                    projectDescription={
                      selectedProject.description ||
                      'Track scope, execution, and AI-assisted planning from one place.'
                    }
                    totalTasks={stats.total}
                    todoTasks={stats.todo}
                    inProgressTasks={stats.inProgress}
                    doneTasks={stats.done}
                  />

                  <AiTaskPanel
                    taskCount={aiTaskCount}
                    isGenerating={isGeneratingTasks}
                    onTaskCountChange={setAiTaskCount}
                    onGenerate={handleGenerateTasks}
                  />
                </div>

                {errorMessage ? (
                  <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                    {errorMessage}
                  </div>
                ) : null}

                <TaskComposer
                  title={taskTitle}
                  status={taskStatus}
                  onTitleChange={setTaskTitle}
                  onStatusChange={setTaskStatus}
                  onCreateTask={handleCreateTask}
                />

                <TaskList
                  tasks={tasks}
                  isLoading={isTasksLoading}
                  hasProjectSelected
                  onStatusChange={handleStatusChange}
                  onDeleteTask={handleDeleteTask}
                />
              </>
            ) : (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/75 px-8 py-20 text-center shadow-[0_25px_80px_-40px_rgba(15,23,42,0.25)]">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                  No active project
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Create a project to unlock the workspace
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                  This dashboard is designed to make delivery planning feel structured and credible.
                  Start with a project, then add tasks manually or generate an initial task plan with AI.
                </p>
                {errorMessage ? (
                  <div className="mx-auto mt-6 max-w-xl rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                    {errorMessage}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
