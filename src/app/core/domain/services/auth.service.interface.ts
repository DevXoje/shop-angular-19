import { Observable } from 'rxjs';
import { User, UserCredentials, AuthResponse, UserRegister } from '../models/user.model';

export interface IAuthService {
  login(credentials: UserCredentials): Observable<AuthResponse>;
  logout(): Observable<void>;
  register(user: UserRegister): Observable<User>;
  getCurrentUser(): Observable<User | null>;
  isAuthenticated(): Observable<boolean>;
}
