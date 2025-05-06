import { Component, input, output, model, inject } from '@angular/core';

import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileUploadService } from '../../../core/infrastructure/services/file-upload.service';

interface FileUploadResponse {
  originalname: string;
  filename: string;
  location: string;
}

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileInputComponent,
      multi: true
    }
  ],
  template: `
    <div class="file-input">
      <label [for]="id()" class="file-input__label">{{ label() }}</label>
    
      @if (previewUrl) {
        <div class="file-input__preview">
          <img [src]="previewUrl" alt="Preview" class="file-input__image">
          <button type="button" class="file-input__remove" (click)="removeFile()">×</button>
        </div>
      }
    
      <div class="file-input__drop-zone"
        [class.file-input__drop-zone--active]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)">
        <input
          [id]="id()"
          type="file"
          [accept]="accept()"
          (change)="onFileSelected($event)"
          class="file-input__input"
          >
        <div class="file-input__content">
          <svg class="file-input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="file-input__text">Drag and drop your image here, or click to select</p>
        </div>
      </div>
    
      @if (error()) {
        <div class="file-input__error">{{ error() }}</div>
      }
    </div>
    `,
  styles: [`
    .file-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-input__label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .file-input__drop-zone {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 150px;
      border: 2px dashed #D1D5DB;
      border-radius: 0.5rem;
      background-color: #F9FAFB;
      transition: all 0.2s;
      cursor: pointer;

      &:hover {
        border-color: #2563EB;
        background-color: #EFF6FF;
      }

      &--active {
        border-color: #2563EB;
        background-color: #EFF6FF;
      }
    }

    .file-input__input {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .file-input__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
    }

    .file-input__icon {
      width: 2rem;
      height: 2rem;
      color: #6B7280;
    }

    .file-input__text {
      margin: 0;
      font-size: 0.875rem;
      color: #6B7280;
      text-align: center;
    }

    .file-input__preview {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto;
    }

    .file-input__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .file-input__remove {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border: none;
      border-radius: 9999px;
      background-color: #EF4444;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #DC2626;
      }
    }

    .file-input__error {
      color: #DC2626;
      font-size: 0.875rem;
    }
  `]
})
export class FileInputComponent implements ControlValueAccessor {
  private readonly fileUploadService = inject(FileUploadService);

  id = input('');
  label = input('');
  accept = input('image/*');
  error = model('');

  fileSelected = output<string>();

  previewUrl: string | null = null;
  isDragging = false;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.previewUrl = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implement if needed
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  removeFile(): void {
    this.previewUrl = null;
    this.onChange(null);
    this.fileSelected.emit('');
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file');
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload the file
    this.fileUploadService.uploadFile(file).subscribe({
      next: (response: FileUploadResponse) => {
        this.onChange(response.location);
        this.fileSelected.emit(response.location);
        this.error.set('');
      },
      error: (error: unknown) => {
        this.error.set('Failed to upload image. Please try again.');
        this.previewUrl = null;
        this.onChange(null);
        this.fileSelected.emit('');
      }
    });
  }
} 