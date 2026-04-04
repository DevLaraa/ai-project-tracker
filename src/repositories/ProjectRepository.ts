import type { Pool } from 'pg';
import type { CreateProjectInput, ProjectId, PublicProject, UpdateProjectInput } from '../models/Project';
import type { UserId } from '../models/User';

type ProjectRow = {
  id: ProjectId;
  name: string;
  description: string | null;
  owner_user_id: UserId;
  created_at: string;
  updated_at: string;
};

const SAFE_PROJECT_COLUMNS = 'id, name, description, owner_user_id, created_at, updated_at';

function mapProjectRow(row: ProjectRow): PublicProject {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerUserId: row.owner_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class ProjectRepository {
  constructor(private readonly pool: Pool) {}

  async listByOwner(ownerUserId: UserId): Promise<PublicProject[]> {
    const { rows } = await this.pool.query<ProjectRow>(
      `
      SELECT ${SAFE_PROJECT_COLUMNS}
      FROM projects
      WHERE owner_user_id = $1
      ORDER BY created_at DESC
      `,
      [ownerUserId]
    );
    return rows.map(mapProjectRow);
  }

  async getByIdForOwner(id: ProjectId, ownerUserId: UserId): Promise<PublicProject | null> {
    const { rows } = await this.pool.query<ProjectRow>(
      `
      SELECT ${SAFE_PROJECT_COLUMNS}
      FROM projects
      WHERE id = $1 AND owner_user_id = $2
      LIMIT 1
      `,
      [id, ownerUserId]
    );
    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  async create(input: CreateProjectInput): Promise<PublicProject> {
    const { rows } = await this.pool.query<ProjectRow>(
      `
      INSERT INTO projects (name, description, owner_user_id)
      VALUES ($1, $2, $3)
      RETURNING ${SAFE_PROJECT_COLUMNS}
      `,
      [input.name, input.description ?? null, input.ownerUserId]
    );
    return mapProjectRow(rows[0]);
  }

  async updateForOwner(
    id: ProjectId,
    ownerUserId: UserId,
    input: UpdateProjectInput
  ): Promise<PublicProject | null> {
    const { rows } = await this.pool.query<ProjectRow>(
      `
      UPDATE projects
      SET
        name = COALESCE($3, name),
        description = COALESCE($4, description),
        updated_at = now()
      WHERE id = $1 AND owner_user_id = $2
      RETURNING ${SAFE_PROJECT_COLUMNS}
      `,
      [id, ownerUserId, input.name ?? null, input.description ?? null]
    );
    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  async deleteForOwner(id: ProjectId, ownerUserId: UserId): Promise<boolean> {
    const result = await this.pool.query(
      `
      DELETE FROM projects
      WHERE id = $1 AND owner_user_id = $2
      `,
      [id, ownerUserId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async existsForOwner(id: ProjectId, ownerUserId: UserId): Promise<boolean> {
    const result = await this.pool.query(
      `
      SELECT 1
      FROM projects
      WHERE id = $1 AND owner_user_id = $2
      LIMIT 1
      `,
      [id, ownerUserId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

