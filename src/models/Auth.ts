import type { PublicUser, UserId } from './User';

export type AuthUser = PublicUser & {
  passwordHash: string;
};

export type AuthenticatedUser = {
  id: UserId;
  email: string;
  name: string;
};

export type JwtPayload = {
  sub: UserId;
  email: string;
  name: string;
};

