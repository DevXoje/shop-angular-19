import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthResponse } from '../../../../core/domain/models/user.model';
import { AuthService } from '../../../../core/infrastructure/services/auth.service';
import { FileUploadService } from '../../../../core/infrastructure/services/file-upload.service';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { FileInputComponent } from '../../../../shared/atoms/file-input/file-input.component';
import { InputComponent } from '../../../../shared/atoms/input/input.component';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { RegisterFormComponent } from './register-form.component';
import { RegisterFormField } from './register-form.types';

interface FileUploadResponse {
  originalname: string;
  filename: string;
  location: string;
}

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let fileUploadService: jasmine.SpyObj<FileUploadService>;
  let router: Router;

  const mockAuthService = {
    register: jasmine.createSpy('register'),
  };

  const mockFileUploadService = {
    uploadFile: jasmine.createSpy('uploadFile'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterFormComponent,
        ReactiveFormsModule,
        InputComponent,
        ButtonComponent,
        FileInputComponent,
        AuthLayoutComponent,
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: FileUploadService, useValue: mockFileUploadService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fileUploadService = TestBed.inject(FileUploadService) as jasmine.SpyObj<FileUploadService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get(RegisterFormField.Email)?.value).toBe('');
    expect(component.registerForm.get(RegisterFormField.Name)?.value).toBe('');
    expect(component.registerForm.get(RegisterFormField.Password)?.value).toBe('');
    expect(component.registerForm.get(RegisterFormField.Avatar)?.value).toBeNull();
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    expect(form.valid).toBeFalsy();
    expect(form.get(RegisterFormField.Email)?.errors?.['required']).toBeTruthy();
    expect(form.get(RegisterFormField.Name)?.errors?.['required']).toBeTruthy();
    expect(form.get(RegisterFormField.Password)?.errors?.['required']).toBeTruthy();
    expect(form.get(RegisterFormField.Avatar)?.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get(RegisterFormField.Email);
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors?.['email']).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get(RegisterFormField.Password);
    passwordControl?.setValue('12345');
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.errors?.['minlength']).toBeFalsy();
  });

  it('should handle file selection', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    component.onAvatarSelected(mockFile);
    expect(component.registerForm.get(RegisterFormField.Avatar)?.value).toBe(mockFile);
  });

  it('should show error message for required fields', () => {
    const emailControl = component.registerForm.get(RegisterFormField.Email);
    emailControl?.markAsTouched();
    expect(component.getErrorMessage(RegisterFormField.Email)).toBe('Email is required');
  });

  it('should show error message for invalid email', () => {
    const emailControl = component.registerForm.get(RegisterFormField.Email);
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    expect(component.getErrorMessage(RegisterFormField.Email)).toBe(
      'Please enter a valid email address',
    );
  });

  it('should show error message for short password', () => {
    const passwordControl = component.registerForm.get(RegisterFormField.Password);
    passwordControl?.setValue('12345');
    passwordControl?.markAsTouched();
    expect(component.getErrorMessage(RegisterFormField.Password)).toBe(
      'Password must be at least 6 characters',
    );
  });

  it('should handle successful registration', fakeAsync(() => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockUploadResponse: FileUploadResponse = {
      originalname: 'test.jpg',
      filename: 'test.jpg',
      location: 'https://example.com/avatar.jpg',
    };
    const mockAuthResponse: AuthResponse = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    };
    const mockRegisterData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      avatar: mockUploadResponse.location,
    };

    fileUploadService.uploadFile.and.returnValue(of(mockUploadResponse));
    authService.register.and.returnValue(of(mockAuthResponse));

    component.registerForm.patchValue({
      [RegisterFormField.Email]: mockRegisterData.email,
      [RegisterFormField.Name]: mockRegisterData.name,
      [RegisterFormField.Password]: mockRegisterData.password,
      [RegisterFormField.Avatar]: mockFile,
    });

    component.onSubmit();
    tick(); // Wait for async operations to complete

    expect(fileUploadService.uploadFile).toHaveBeenCalledWith(mockFile);
    expect(authService.register).toHaveBeenCalledWith(mockRegisterData);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
  }));

  it('should handle registration error', fakeAsync(() => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockUploadResponse: FileUploadResponse = {
      originalname: 'test.jpg',
      filename: 'test.jpg',
      location: 'https://example.com/avatar.jpg',
    };
    const errorMessage = 'Registration failed';

    fileUploadService.uploadFile.and.returnValue(of(mockUploadResponse));
    authService.register.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.registerForm.patchValue({
      [RegisterFormField.Email]: 'test@example.com',
      [RegisterFormField.Name]: 'Test User',
      [RegisterFormField.Password]: 'password123',
      [RegisterFormField.Avatar]: mockFile,
    });

    component.onSubmit();
    tick(); // Wait for async operations to complete

    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBeFalse();
  }));

  it('should not submit form when invalid', () => {
    component.onSubmit();
    expect(fileUploadService.uploadFile).not.toHaveBeenCalled();
    expect(authService.register).not.toHaveBeenCalled();
  });
});
