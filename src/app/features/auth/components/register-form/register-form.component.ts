import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputComponent } from '../../../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { AuthService } from '../../../../core/infrastructure/services/auth.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
    selector: 'app-register-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, RouterModule, AuthLayoutComponent],
    template: `
    <app-auth-layout>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
        <h2 class="register-form__title">Create an account</h2>
        
        <app-input
          formControlName="email"
          label="Email"
          type="email"
          id="email"
          placeholder="Enter your email"
          [error]="getErrorMessage('email')"
        ></app-input>

        <app-input
          formControlName="firstName"
          label="First Name"
          type="text"
          id="firstName"
          placeholder="Enter your first name"
          [error]="getErrorMessage('firstName')"
        ></app-input>

        <app-input
          formControlName="lastName"
          label="Last Name"
          type="text"
          id="lastName"
          placeholder="Enter your last name"
          [error]="getErrorMessage('lastName')"
        ></app-input>

        <app-input
          formControlName="password"
          label="Password"
          type="password"
          id="password"
          placeholder="Enter your password"
          [error]="getErrorMessage('password')"
        ></app-input>

        <app-button
          type="submit"
          variant="primary"
          [loading]="loading"
          [disabled]="registerForm.invalid"
        >
          Sign Up
        </app-button>

        <div *ngIf="error" class="register-form__error">
          {{ error }}
        </div>

        <div class="register-form__footer">
          <p class="register-form__text">Already have an account?</p>
          <a routerLink="/auth/login" class="register-form__link">Sign in</a>
        </div>
      </form>
    </app-auth-layout>
  `,
    styles: [`
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      padding: 2rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }

    .register-form__title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
      text-align: center;
    }

    .register-form__error {
      color: #DC2626;
      font-size: 0.875rem;
      text-align: center;
    }

    .register-form__footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .register-form__text {
      color: #6B7280;
      font-size: 0.875rem;
      margin: 0;
    }

    .register-form__link {
      color: #2563EB;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #1D4ED8;
        text-decoration: underline;
      }
    }
  `]
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  error = '';

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.error = error.error?.message || 'An error occurred during registration';
          this.loading = false;
        }
      });
    }
  }
} 