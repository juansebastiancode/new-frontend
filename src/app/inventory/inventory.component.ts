import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="inventory-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="inventory-container">
          <h2>Inventory</h2>
          <p>This is the inventory module. Here you can manage items, stock and basic lists.</p>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .inventory-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .inventory-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; }
    p { color: #555; }
    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class InventoryComponent {
  showProfile: boolean = false;

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }
}


