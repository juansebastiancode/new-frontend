import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="customers-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="customers-container">
          <h2>Customers</h2>
          <p>Manage your customers, contacts and segments here.</p>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .customers-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .customers-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; }
    p { color: #555; }
    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class CustomersComponent {
  showProfile: boolean = false;

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }
}


