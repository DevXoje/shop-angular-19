import { Routes } from '@angular/router';
import { authGuard } from '../../core/infrastructure/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login-form/login-form.component').then(m => m.LoginFormComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register-form/register-form.component').then(m => m.RegisterFormComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  }
]; 