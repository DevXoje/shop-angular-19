import { Component, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-input',
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="input-container">
      <label [for]="id()" class="input-label">{{ label() }}</label>
      <input
        [type]="type()"
        [id]="id()"
        [value]="value"
        [placeholder]="placeholder()"
        [disabled]="disabled"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="input-field"
      />
      <div *ngIf="error()" class="input-error">{{ error() }}</div>
    </div>
  `,
    styles: [`
    .input-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .input-field {
      padding: 0.5rem;
      border: 1px solid #D1D5DB;
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out;

      &:focus {
        outline: none;
        border-color: #2563EB;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
      }

      &:disabled {
        background-color: #F3F4F6;
        cursor: not-allowed;
      }
    }

    .input-error {
      color: #DC2626;
      font-size: 0.875rem;
    }
  `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
  label = input('');
  type = input('text');
  placeholder = input('');
  id = input('');
  error = input('');

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 