import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="suppliers-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="suppliers-container">
          <h2>Proveedores</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'suppliers'" (click)="select('suppliers')">Proveedores</button>
            <button class="tab" [class.active]="selected === 'contacts'" (click)="select('contacts')">Contactos</button>
            <button class="tab" [class.active]="selected === 'purchases'" (click)="select('purchases')">Compras</button>
          </div>

          <div class="section" *ngIf="selected === 'suppliers'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar proveedores..." [(ngModel)]="searchSuppliers" />
              </div>
              <button class="primary" (click)="addSupplier()">Añadir proveedor</button>
            </div>
            <p class="muted">Gestiona tus proveedores y sus datos.</p>
            <div class="card">Aún no tienes proveedores registrados.</div>
          </div>

          <div class="section" *ngIf="selected === 'contacts'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar contactos..." [(ngModel)]="searchContacts" />
              </div>
              <button class="primary" (click)="addContact()">Añadir contacto</button>
            </div>
            <p class="muted">Administra los contactos de tus proveedores.</p>
            <div class="card">No hay contactos registrados.</div>
          </div>

          <div class="section" *ngIf="selected === 'purchases'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar compras..." [(ngModel)]="searchPurchases" />
              </div>
              <button class="primary" (click)="addPurchase()">Nueva compra</button>
            </div>
            <p class="muted">Registra y gestiona tus compras a proveedores.</p>
            <div class="card">No hay compras registradas.</div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .suppliers-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .suppliers-container { padding: 24px; }
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
export class SuppliersComponent {
  showProfile: boolean = false;
  selected: 'suppliers' | 'contacts' | 'purchases' = 'suppliers';
  searchSuppliers: string = '';
  searchContacts: string = '';
  searchPurchases: string = '';

  select(section: 'suppliers' | 'contacts' | 'purchases') { this.selected = section; }

  addSupplier() { alert('Añadir proveedor'); }
  addContact() { alert('Añadir contacto'); }
  addPurchase() { alert('Nueva compra'); }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}


