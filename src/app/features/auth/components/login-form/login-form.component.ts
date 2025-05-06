import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { AuthService } from '../../../../core/infrastructure/services/auth.service';

@Component({
    selector: 'app-login-form',
    imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
    template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
      <h2 class="login-form__title">Login to your account</h2>
      
      <app-input
        formControlName="email"
        label="Email"
        type="email"
        id="email"
        placeholder="Enter your email"
        [error]="getErrorMessage('email')"
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
        [disabled]="loginForm.invalid"
      >
        Sign In
      </app-button>

      <div *ngIf="error" class="login-form__error">
        {{ error }}
      </div>
    </form>
  `,
    styles: [`
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 400px;
      width: 100%;
      padding: 2rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }

    .login-form__title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
      text-align: center;
    }

    .login-form__error {
      color: #DC2626;
      font-size: 0.875rem;
      text-align: center;
    }
  `]
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  error = '';

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
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
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.error = error.error?.message || 'An error occurred during login';
          this.loading = false;
        }
      });
    }
  }
} 