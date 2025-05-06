import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputComponent } from '../../../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { FileInputComponent } from '../../../../shared/atoms/file-input/file-input.component';
import { AuthService } from '../../../../core/infrastructure/services/auth.service';
import { FileUploadService } from '../../../../core/infrastructure/services/file-upload.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { finalize, switchMap } from 'rxjs';
import { RegisterFormData, RegisterFormField } from './register-form.types';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    FileInputComponent,
    RouterModule,
    AuthLayoutComponent,
  ],
  template: `
    <app-auth-layout>
      <form
        [formGroup]="registerForm"
        (ngSubmit)="registerForm.valid && onSubmit()"
        class="register-form"
      >
        <h2 class="register-form__title">Create an account</h2>

        <app-input
          [formControlName]="RegisterFormField.Email"
          label="Email"
          type="email"
          id="email"
          placeholder="Enter your email"
          [error]="getErrorMessage(RegisterFormField.Email)"
        ></app-input>

        <app-input
          [formControlName]="RegisterFormField.Name"
          label="Name"
          type="text"
          id="name"
          placeholder="Enter your name"
          [error]="getErrorMessage(RegisterFormField.Name)"
        ></app-input>

        <app-input
          [formControlName]="RegisterFormField.Password"
          label="Password"
          type="password"
          id="password"
          placeholder="Enter your password"
          [error]="getErrorMessage(RegisterFormField.Password)"
        ></app-input>

        <app-file-input
          [formControlName]="RegisterFormField.Avatar"
          label="Profile Picture"
          id="avatar"
          [error]="getErrorMessage(RegisterFormField.Avatar)"
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
  styles: [
    `
      .register-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        padding: 2rem;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow:
          0 1px 3px 0 rgb(0 0 0 / 0.1),
          0 1px 2px -1px rgb(0 0 0 / 0.1);
      }

      .register-form__title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
        text-align: center;
      }

      .register-form__error {
        color: #dc2626;
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
        color: #6b7280;
        font-size: 0.875rem;
        margin: 0;
      }

      .register-form__link {
        color: #2563eb;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class RegisterFormComponent {
  protected readonly RegisterFormField = RegisterFormField;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    [RegisterFormField.Email]: ['', [Validators.required, Validators.email]],
    [RegisterFormField.Name]: ['', [Validators.required]],
    [RegisterFormField.Password]: ['', [Validators.required, Validators.minLength(6)]],
    [RegisterFormField.Avatar]: [null, [Validators.required]],
  });

  loading = false;
  error = '';

  getErrorMessage(controlName: RegisterFormField): string {
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

  onAvatarSelected(file: File | null): void {
    this.registerForm.patchValue({ [RegisterFormField.Avatar]: file });
  }

  onSubmit(): void {
    // Prevent submission if form is invalid
    if (this.registerForm.invalid || this.loading) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Get form data before setting loading state
    const formData = this.registerForm.value;
    const avatarFile = formData[RegisterFormField.Avatar] as File;

    // Validate required data
    if (!avatarFile) {
      this.error = 'Avatar file is required';
      return;
    }

    this.loading = true;
    this.error = '';

    // First upload the file, then register the user
    this.fileUploadService
      .uploadFile(avatarFile)
      .pipe(
        switchMap(response => {
          const registerData: RegisterFormData = {
            ...formData,
            [RegisterFormField.Avatar]: response.location,
          };
          return this.authService.register(registerData);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: error => {
          this.error = error.error?.message || 'An error occurred during registration';
        },
      });
  }
}
