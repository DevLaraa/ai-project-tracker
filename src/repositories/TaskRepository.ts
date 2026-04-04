import type { Pool, PoolClient } from 'pg';
import type { ProjectId } from '../models/Project';
import type { CreateTaskInput, PublicTask, TaskId, UpdateTaskRecordInput } from '../models/Task';
import type { UserId } from '../models/User';

type TaskRow = {
  id: TaskId;
  project_id: ProjectId;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  assigned_user_id: UserId | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

const TASK_COLUMNS =
  'id, project_id, title, description, status, assigned_user_id, due_date, created_at, updated_at';

const TASK_COLUMNS_WITH_ALIAS =
  't.id, t.project_id, t.title, t.description, t.status, t.assigned_user_id, t.due_date, t.created_at, t.updated_at';

function mapTaskRow(row: TaskRow): PublicTask {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    assignedUserId: row.assigned_user_id,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class TaskRepository {
  constructor(private readonly pool: Pool) {}

  private async insertTask(executor: Pool | PoolClient, input: CreateTaskInput): Promise<PublicTask> {
    const { rows } = await executor.query<TaskRow>(
      `
      INSERT INTO tasks (project_id, title, description, status, assigned_user_id, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${TASK_COLUMNS}
      `,
      [
        input.projectId,
        input.title,
        input.description ?? null,
        input.status ?? 'todo',
        input.assignedUserId ?? null,
        input.dueDate ?? null
      ]
    );

    return mapTaskRow(rows[0]);
  }

  async listForOwner(ownerUserId: UserId, projectId?: ProjectId): Promise<PublicTask[]> {
    const query =
      projectId === undefined
        ? `
          SELECT ${TASK_COLUMNS_WITH_ALIAS}
          FROM tasks t
          INNER JOIN projects p ON p.id = t.project_id
          WHERE p.owner_user_id = $1
          ORDER BY t.created_at DESC
        `
        : `
          SELECT ${TASK_COLUMNS_WITH_ALIAS}
          FROM tasks t
          INNER JOIN projects p ON p.id = t.project_id
          WHERE p.owner_user_id = $1 AND t.project_id = $2
          ORDER BY t.created_at DESC
        `;

    const params = projectId === undefined ? [ownerUserId] : [ownerUserId, projectId];
    const { rows } = await this.pool.query<TaskRow>(query, params);
    return rows.map(mapTaskRow);
  }

  async getByIdForOwner(id: TaskId, ownerUserId: UserId): Promise<PublicTask | null> {
    const { rows } = await this.pool.query<TaskRow>(
      `
      SELECT ${TASK_COLUMNS_WITH_ALIAS}
      FROM tasks t
      INNER JOIN projects p ON p.id = t.project_id
      WHERE t.id = $1 AND p.owner_user_id = $2
      LIMIT 1
      `,
      [id, ownerUserId]
    );
    return rows[0] ? mapTaskRow(rows[0]) : null;
  }

  async create(input: CreateTaskInput): Promise<PublicTask> {
    return this.insertTask(this.pool, input);
  }

  async createWithClient(client: PoolClient, input: CreateTaskInput): Promise<PublicTask> {
    return this.insertTask(client, input);
  }

  async updateForOwner(
    id: TaskId,
    ownerUserId: UserId,
    input: UpdateTaskRecordInput
  ): Promise<PublicTask | null> {
    const { rows } = await this.pool.query<TaskRow>(
      `
      UPDATE tasks t
      SET
        project_id = $3,
        title = $4,
        description = $5,
        status = $6,
        assigned_user_id = $7,
        due_date = $8,
        updated_at = now()
      FROM projects p
      WHERE t.id = $1 AND p.id = t.project_id AND p.owner_user_id = $2
      RETURNING ${TASK_COLUMNS_WITH_ALIAS}
      `,
      [
        id,
        ownerUserId,
        input.projectId,
        input.title,
        input.description ?? null,
        input.status,
        input.assignedUserId ?? null,
        input.dueDate ?? null
      ]
    );
    return rows[0] ? mapTaskRow(rows[0]) : null;
  }

  async deleteForOwner(id: TaskId, ownerUserId: UserId): Promise<boolean> {
    const result = await this.pool.query(
      `
      DELETE FROM tasks t
      USING projects p
      WHERE t.id = $1 AND p.id = t.project_id AND p.owner_user_id = $2
      `,
      [id, ownerUserId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
