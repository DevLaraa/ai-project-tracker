export type UserId = string;

// Input used to create users across controller/service/repository.
export type CreateUserInput = {
  email: string;
  name: string;
  password: string;
};

export type CreateUserRecordInput = {
  email: string;
  name: string;
  passwordHash: string;
};

// Public fields that are safe to return in API responses.
export type PublicUser = {
  id: UserId;
  email: string;
  name: string;
  createdAt: string; // ISO string from the DB row
};

// Backward-compatible alias used across layers.
export type User = PublicUser;

// Example of internal DB shape when sensitive fields exist.
// Never return this type directly from controllers.
export type UserRecord = PublicUser & {
  passwordHash: string;
};

