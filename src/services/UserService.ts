import bcrypt from 'bcrypt';
import { env } from '../config/env';
import type { CreateUserInput, CreateUserRecordInput, PublicUser, UserId } from '../models/User';
import type { UserRepository } from '../repositories/UserRepository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async listUsers(limit: number, offset: number): Promise<PublicUser[]> {
    const safeLimit = Math.max(1, Math.min(limit, env.MAX_PAGE_LIMIT));
    const safeOffset = Math.max(0, offset);
    return this.userRepository.list(safeLimit, safeOffset);
  }

  async createUser(input: CreateUserInput): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    const createRecordInput: CreateUserRecordInput = {
      email: input.email,
      name: input.name,
      passwordHash
    };
    return this.userRepository.create(createRecordInput);
  }

  async getUserById(id: UserId): Promise<PublicUser | null> {
    return this.userRepository.getById(id);
  }
}

