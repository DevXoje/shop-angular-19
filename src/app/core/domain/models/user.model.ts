export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export type UserRegister = Pick<User, 'email' | 'password' | 'name' | 'avatar'>;

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}
