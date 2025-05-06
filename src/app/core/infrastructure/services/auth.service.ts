import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { User, UserCredentials, AuthResponse, UserRegister } from '../../domain/models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements IAuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  login(credentials: UserCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authUrl}/login`, credentials)
      .pipe(tap(response => this.handleAuthResponse(response)));
  }

  logout(): Observable<void> {
    this.clearAuthData();
    return new Observable<void>(observer => {
      observer.next();
      observer.complete();
    });
  }

  register(user: UserRegister): Observable<User> {
    return this.http.post<User>(`${this.usersUrl}`, user).pipe(
      tap(() => {
        // After successful registration, automatically log in
        const credentials: UserCredentials = {
          email: user.email,
          password: user.password,
        };
        this.login(credentials).subscribe();
      }),
    );
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.currentUser$.subscribe(user => {
        observer.next(!!user);
      });
    });
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    this.fetchUserProfile();
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.fetchUserProfile();
    }
  }

  private fetchUserProfile(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log({ headers, token });

    this.http.get<User>(`${this.authUrl}/profile`, { headers }).subscribe({
      next: user => this.currentUserSubject.next(user),
      error: () => this.clearAuthData(),
    });
  }
}
