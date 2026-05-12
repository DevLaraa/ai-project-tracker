import type { Pool } from 'pg';
import type { AuthUser } from '../models/Auth';
import type { CreateUserRecordInput, PublicUser, UserId } from '../models/User';
import { HttpError } from '../utils/httpError';

type SafeUserRow = {
  id: UserId;
  email: string;
  name: string;
  created_at: string;
};

type AuthUserRow = SafeUserRow & {
  password_hash: string;
};

const SAFE_USER_SELECT_COLUMNS = 'id, email, name, created_at';

function mapSafeUserRow(row: SafeUserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at
  };
}

export class UserRepository {
  constructor(private readonly pool: Pool) {}

  async list(limit: number, offset: number): Promise<PublicUser[]> {
    const { rows } = await this.pool.query<SafeUserRow>(
      `
      SELECT ${SAFE_USER_SELECT_COLUMNS}
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    return rows.map(mapSafeUserRow);
  }

  async create(input: CreateUserRecordInput): Promise<PublicUser> {
    try {
      const { rows } = await this.pool.query<SafeUserRow>(
        `
        INSERT INTO users (email, name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING ${SAFE_USER_SELECT_COLUMNS}
        `,
        [input.email, input.name, input.passwordHash]
      );

      const row = rows[0];
      if (!row) throw new Error('Failed to insert user');

      return mapSafeUserRow(row);
    } catch (err: unknown) {
      // Unique violation (email already exists)
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const code = (err as { code?: unknown }).code;
        if (code === '23505') {
          throw new HttpError(409, 'A user with that email already exists');
        }
      }
      throw err;
    }
  }

  async getById(id: UserId): Promise<PublicUser | null> {
    const { rows } = await this.pool.query<SafeUserRow>(
      `
      SELECT ${SAFE_USER_SELECT_COLUMNS}
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    const row = rows[0];
    if (!row) return null;

    return mapSafeUserRow(row);
  }

  async getAuthByEmail(email: string): Promise<AuthUser | null> {
    const { rows } = await this.pool.query<AuthUserRow>(
      `
      SELECT ${SAFE_USER_SELECT_COLUMNS}, password_hash
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      passwordHash: row.password_hash
    };
  }

  async existsById(id: UserId): Promise<boolean> {
    const result = await this.pool.query(
      `
      SELECT 1
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

