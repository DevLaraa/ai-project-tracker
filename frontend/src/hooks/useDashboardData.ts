import { useCallback, useEffect, useMemo, useState } from 'react';
import { logout } from '../api/auth';
import { createProject, getProjects } from '../api/projects';
import { createTask, deleteTask, generateAndCreateTasksWithAI, getTasks, updateTask } from '../api/tasks';
import type { CreateProjectInput, Project } from '../types/projects';
import type { CreateTaskInput, Task, TaskStatus } from '../types/tasks';
import { getApiErrorMessage } from '../utils/apiError';

type DashboardStats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
};

export function useDashboardData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const stats = useMemo<DashboardStats>(() => {
    const total = tasks.length;
    const todo = tasks.filter((task) => task.status === 'todo').length;
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
    const done = tasks.filter((task) => task.status === 'done').length;

    return { total, todo, inProgress, done };
  }, [tasks]);

  const fetchProjects = useCallback(async () => {
    setIsProjectsLoading(true);

    try {
      setErrorMessage('');
      const data = await getProjects();
      setProjects(data);
      setSelectedProjectId((current) => {
        if (data.length === 0) {
          return null;
        }

        if (current && data.some((project) => project.id === current)) {
          return current;
        }

        return data[0].id;
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to load projects. Please try again.'));
    } finally {
      setIsProjectsLoading(false);
      setIsBootstrapping(false);
    }
  }, []);

  const fetchTasks = useCallback(async (projectId: string) => {
    setIsTasksLoading(true);

    try {
      setErrorMessage('');
      const data = await getTasks(projectId);
      setTasks(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to load tasks. Please try again.'));
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }

    void fetchTasks(selectedProjectId);
  }, [fetchTasks, selectedProjectId]);

  const createNewProject = useCallback(
    async (input: CreateProjectInput) => {
      const createdProject = await createProject(input);
      setProjects((current) => [createdProject, ...current]);
      setSelectedProjectId(createdProject.id);
      return createdProject;
    },
    []
  );

  const createNewTask = useCallback(
    async (input: CreateTaskInput) => {
      const createdTask = await createTask(input);
      setTasks((current) => [createdTask, ...current]);
      return createdTask;
    },
    []
  );

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    const updatedTask = await updateTask(taskId, { status });
    setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
    return updatedTask;
  }, []);

  const removeTask = useCallback(async (taskId: string) => {
    await deleteTask(taskId);
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  const generateTasks = useCallback(
    async (taskCount: number) => {
      if (!selectedProject) {
        return;
      }

      setIsGeneratingTasks(true);

      try {
        setErrorMessage('');
        await generateAndCreateTasksWithAI({
          projectId: selectedProject.id,
          taskCount
        });

        await fetchTasks(selectedProject.id);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, 'Failed to generate tasks with AI. Please try again.')
        );
      } finally {
        setIsGeneratingTasks(false);
      }
    },
    [fetchTasks, selectedProject]
  );

  const signOut = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, []);

  return {
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
  };
}
