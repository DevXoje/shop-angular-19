import { Observable } from 'rxjs';
import { User, UserCredentials, AuthResponse } from '../models/user.model';

export interface IAuthService {
  login(credentials: UserCredentials): Observable<AuthResponse>;
  logout(): Observable<void>;
  register(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Observable<AuthResponse>;
  getCurrentUser(): Observable<User | null>;
  isAuthenticated(): Observable<boolean>;
} 