import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { AuthService } from '../../../../core/infrastructure/services/auth.service';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, ButtonComponent],
    template: `
    <div class="profile">
      <h2 class="profile__title">Profile</h2>
      
      <div class="profile__info" *ngIf="user$ | async as user">
        <div class="profile__field">
          <span class="profile__label">Email:</span>
          <span class="profile__value">{{ user.email }}</span>
        </div>
        
        <div class="profile__field">
          <span class="profile__label">Name:</span>
          <span class="profile__value">{{ user.name }} </span>
        </div>
        
        <div class="profile__field">
          <span class="profile__label">Role:</span>
          <span class="profile__value">{{ user.role }}</span>
        </div>
      </div>

      <app-button
        variant="secondary"
        (clicked)="onLogout()"
      >
        Logout
      </app-button>
    </div>
  `,
    styles: [`
    .profile {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 600px;
      width: 100%;
      padding: 2rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }

    .profile__title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
      text-align: center;
    }

    .profile__info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .profile__field {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background-color: #F9FAFB;
      border-radius: 0.375rem;
    }

    .profile__label {
      font-weight: 500;
      color: #374151;
      min-width: 100px;
    }

    .profile__value {
      color: #6B7280;
    }
  `]
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user$ = this.authService.getCurrentUser();

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }
} 