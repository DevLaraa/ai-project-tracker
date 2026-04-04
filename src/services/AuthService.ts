import bcrypt from 'bcrypt';
import { env } from '../config/env';
import type { AuthenticatedUser } from '../models/Auth';
import type { UserRepository } from '../repositories/UserRepository';
import { HttpError } from '../utils/httpError';
import { signJwt } from '../utils/jwt';

type LoginResult = {
  accessToken: string;
  user: AuthenticatedUser;
};

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(input: { email: string; password: string; name?: string }): Promise<LoginResult> {
    const existingUser = await this.userRepository.getAuthByEmail(input.email);
    if (existingUser) {
      throw new HttpError(409, 'User already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const createdUser = await this.userRepository.create({
      email: input.email,
      name: input.name ?? 'User',
      passwordHash
    });

    const user: AuthenticatedUser = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name
    };

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name
    });

    return { accessToken, user };
  }

  async login(input: { email: string; password: string }): Promise<LoginResult> {
    const authUser = await this.userRepository.getAuthByEmail(input.email);
    if (!authUser) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(input.password, authUser.passwordHash);
    if (!isValidPassword) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const user: AuthenticatedUser = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name
    };

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name
    });

    return { accessToken, user };
  }
}

