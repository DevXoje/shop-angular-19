import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__container">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f3f4f6;
        padding: 1rem;
      }

      .auth-layout__container {
        width: 100%;
        max-width: 400px;
      }
    `,
  ],
})
export class AuthLayoutComponent {}
