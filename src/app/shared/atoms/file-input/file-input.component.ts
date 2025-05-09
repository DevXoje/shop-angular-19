import { Component, input, output, model } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileInputComponent,
      multi: true,
    },
  ],
  template: `
    <div class="file-input">
      <label [for]="id()" class="file-input__label">{{ label() }}</label>

      @if (previewUrl) {
        <div class="file-input__preview">
          <img [src]="previewUrl" alt="Preview" class="file-input__image" />
          <button type="button" class="file-input__remove" (click)="removeFile()">×</button>
        </div>
      } @else {
        <div
          class="file-input__drop-zone"
          [class.file-input__drop-zone--active]="isDragging"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <input
            [id]="id()"
            type="file"
            [accept]="accept()"
            (change)="onFileSelected($event)"
            class="file-input__input"
          />
          <div class="file-input__content">
            <svg class="file-input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p class="file-input__text">Drag and drop your image here, or click to select</p>
          </div>
        </div>
      }

      @if (error()) {
        <div class="file-input__error">{{ error() }}</div>
      }
    </div>
  `,
  styles: [
    `
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
        border: 2px dashed #d1d5db;
        border-radius: 0.5rem;
        background-color: #f9fafb;
        transition: all 0.2s;
        cursor: pointer;

        &:hover {
          border-color: #2563eb;
          background-color: #eff6ff;
        }

        &--active {
          border-color: #2563eb;
          background-color: #eff6ff;
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
        color: #6b7280;
      }

      .file-input__text {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
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
        background-color: #ef4444;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #dc2626;
        }
      }

      .file-input__error {
        color: #dc2626;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class FileInputComponent implements ControlValueAccessor {
  id = input('');
  label = input('');
  accept = input('image/*');
  error = model('');

  fileSelected = output<File | null>();

  previewUrl: string | null = null;
  isDragging = false;
  private onChange: (value: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.previewUrl = value;
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {
    // Not implemented as this component doesn't support disabled state
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
    this.fileSelected.emit(null);
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file');
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = e => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.onChange(file);
    this.fileSelected.emit(file);
    this.error.set('');
  }
}
