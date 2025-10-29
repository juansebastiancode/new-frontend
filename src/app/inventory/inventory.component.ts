import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="inventory-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="inventory-container">
          <h2>Inventario</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'items'" (click)="select('items')">Artículos</button>
            <button class="tab" [class.active]="selected === 'categories'" (click)="select('categories')">Categorías</button>
            <button class="tab" [class.active]="selected === 'movements'" (click)="select('movements')">Movimientos</button>
          </div>

          <div class="section" *ngIf="selected === 'items'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar artículos..." [(ngModel)]="searchItems" />
              </div>
              <button class="primary" (click)="addItem()">Añadir artículo</button>
            </div>
            <p class="muted">Gestiona tus artículos del inventario.</p>
            <div class="card">Aún no tienes artículos registrados.</div>
          </div>

          <div class="section" *ngIf="selected === 'categories'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar categorías..." [(ngModel)]="searchCategories" />
              </div>
              <button class="primary" (click)="addCategory()">Añadir categoría</button>
            </div>
            <p class="muted">Organiza tus artículos por categorías.</p>
            <div class="card">No hay categorías registradas.</div>
          </div>

          <div class="section" *ngIf="selected === 'movements'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar movimientos..." [(ngModel)]="searchMovements" />
              </div>
              <button class="primary" (click)="addMovement()">Nuevo movimiento</button>
            </div>
            <p class="muted">Registra entradas y salidas de stock.</p>
            <div class="card">No hay movimientos registrados.</div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .inventory-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .inventory-container { padding: 24px; }
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
export class InventoryComponent {
  showProfile: boolean = false;
  selected: 'items' | 'categories' | 'movements' = 'items';
  searchItems: string = '';
  searchCategories: string = '';
  searchMovements: string = '';

  select(section: 'items' | 'categories' | 'movements') { this.selected = section; }

  addItem() { alert('Añadir artículo'); }
  addCategory() { alert('Añadir categoría'); }
  addMovement() { alert('Nuevo movimiento'); }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }
}


