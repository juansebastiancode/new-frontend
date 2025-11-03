import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent],
  template: `
  <div class="page">
    <app-menubar (profileClick)="showProfile = !showProfile"></app-menubar>
    <div class="content">
      <app-profile *ngIf="showProfile" (closeProfile)="showProfile=false"></app-profile>
      <h2>Orders</h2>
      <p>Gestiona los pedidos recibidos de tus clientes aquí.</p>
    </div>
  </div>
  `,
  styles: [`
    .page { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    .content { padding: 24px; }
  `]
})
export class OrdersComponent {
  showProfile: boolean = false;
}


