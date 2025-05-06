import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputComponent } from '../../../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { FileInputComponent } from '../../../../shared/atoms/file-input/file-input.component';
import { AuthService } from '../../../../core/infrastructure/services/auth.service';
import { FileUploadService } from '../../../../core/infrastructure/services/file-upload.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { switchMap } from 'rxjs';

interface RegisterFormData {
  email: string;
  name: string;
  password: string;
  avatar: string;
}

@Component({
    selector: 'app-register-form',
    standalone: true,
    imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    FileInputComponent,
    RouterModule,
    AuthLayoutComponent
],
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
          formControlName="name"
          label="Name"
          type="text"
          id="name"
          placeholder="Enter your name"
          [error]="getErrorMessage('name')"
        ></app-input>
    
        <app-input
          formControlName="password"
          label="Password"
          type="password"
          id="password"
          placeholder="Enter your password"
          [error]="getErrorMessage('password')"
        ></app-input>
    
        <app-file-input
          formControlName="avatar"
          label="Profile Picture"
          id="avatar"
          [error]="getErrorMessage('avatar')"
          (fileSelected)="onAvatarSelected($event)"
        ></app-file-input>
    
        <app-button
          type="submit"
          variant="primary"
          [loading]="loading"
          [disabled]="registerForm.invalid"
          >
          Sign Up
        </app-button>
    
        @if (error) {
          <div class="register-form__error">
            {{ error }}
          </div>
        }
    
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
  private readonly fileUploadService = inject(FileUploadService);
  private readonly router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    avatar: [null, [Validators.required]]
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

  onAvatarSelected(file: File): void {
    this.registerForm.patchValue({ avatar: file });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.registerForm.value;
      const avatarFile = formData.avatar as File;

      // First upload the file, then register the user
      this.fileUploadService.uploadFile(avatarFile).pipe(
        switchMap(response => {
          const registerData: RegisterFormData = {
            ...formData,
            avatar: response.location
          };
          return this.authService.register(registerData);
        })
      ).subscribe({
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