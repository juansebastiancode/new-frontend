import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="customers-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="customers-container">
          <h2>Clientes</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'clients'" (click)="select('clients')">Clientes</button>
            <button class="tab" [class.active]="selected === 'leads'" (click)="select('leads')">Posibles clientes</button>
          </div>

          <div class="section" *ngIf="selected === 'clients'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar clientes..." [(ngModel)]="searchClients" />
              </div>
              <button class="primary" (click)="addClient()">Añadir cliente</button>
            </div>
            <p class="muted">Lista de clientes actuales.</p>
            <div class="card">Aún no tienes clientes.</div>
          </div>

          <div class="section" *ngIf="selected === 'leads'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar posibles clientes..." [(ngModel)]="searchLeads" />
              </div>
              <button class="primary" (click)="addLead()">Añadir posible cliente</button>
            </div>
            <p class="muted">Aquí podrás gestionar tus posibles clientes (leads).</p>
            <div class="card">Aún no tienes posibles clientes.</div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .customers-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .customers-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; }
    .muted { color: #555; font-size: 13px; margin: 0 0 8px 0; }

    .tabs { display: flex; gap: 8px; margin: 8px 0 24px 0; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
    .tab.active { background: #111; color: #fff; border-color: #111; }

    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 12px 0; }
    .search { min-width: 240px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; outline: none; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; background: #fff; }
    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class CustomersComponent {
  showProfile: boolean = false;
  selected: 'leads' | 'clients' = 'clients';
  searchLeads: string = '';
  searchClients: string = '';

  select(section: 'leads' | 'clients') { this.selected = section; }

  addLead() { alert('Añadir posible cliente'); }
  addClient() { alert('Añadir cliente'); }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}


