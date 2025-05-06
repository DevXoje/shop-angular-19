import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__container">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #F3F4F6;
      padding: 1rem;
    }

    .auth-layout__container {
      width: 100%;
      max-width: 400px;
    }
  `]
})
export class AuthLayoutComponent {} 