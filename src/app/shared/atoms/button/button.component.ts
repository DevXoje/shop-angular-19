import { Component,input, output } from '@angular/core';


@Component({
    selector: 'app-button',
    imports: [],
    template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="onClick()"
      class="button"
      [class.button--primary]="variant() === 'primary'"
      [class.button--secondary]="variant() === 'secondary'"
      [class.button--loading]="loading()"
      >
      @if (loading()) {
        <span class="button__loader"></span>
      }
      <ng-content></ng-content>
    </button>
    `,
    styles: [`
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 0.375rem;
      transition: all 0.15s ease-in-out;
      cursor: pointer;
      min-width: 100px;
      position: relative;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      &--primary {
        background-color: #2563EB;
        color: white;
        border: none;

        &:hover:not(:disabled) {
          background-color: #1D4ED8;
        }
      }

      &--secondary {
        background-color: white;
        color: #374151;
        border: 1px solid #D1D5DB;

        &:hover:not(:disabled) {
          background-color: #F9FAFB;
        }
      }

      &--loading {
        color: transparent;
      }
    }

    .button__loader {
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary'>('primary');
  disabled = input(false);
  loading = input(false);
  clicked = output<void>();

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
} 