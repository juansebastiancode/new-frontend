import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="budgets-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="budgets-container">
          <h2>Presupuestos</h2>
          <p>Gestiona los presupuestos del proyecto.</p>
          
          <div class="tabs">
            <button class="tab" [class.active]="selectedTab === 'internal'" (click)="selectedTab = 'internal'">Internos</button>
            <button class="tab" [class.active]="selectedTab === 'clients'" (click)="selectedTab = 'clients'">Clientes</button>
          </div>

          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar presupuestos..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addBudget()">
              <i class="fas fa-plus"></i>
              Nuevo presupuesto
            </button>
          </div>

          <div class="budgets-grid" *ngIf="selectedTab === 'internal'">
            <div class="budget-card" *ngFor="let budget of filteredBudgets">
              <div class="budget-header">
                <div class="budget-icon">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="budget-info">
                  <h3>{{ budget.name }}</h3>
                  <p class="budget-status">{{ budget.status }}</p>
                </div>
                <div class="budget-actions">
                  <button class="action-btn edit-btn" (click)="editBudget(budget)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteBudget(budget)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="budget-details">
                <div class="detail-item">
                  <span class="detail-label">Importe:</span>
                  <span class="detail-value amount">€{{ budget.amount || '0.00' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Cliente:</span>
                  <span class="detail-value">{{ budget.client || 'Sin cliente' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha:</span>
                  <span class="detail-value">{{ budget.date }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredBudgets.length === 0 && selectedTab === 'internal'">
            <i class="fas fa-file-invoice-dollar empty-icon"></i>
            <h3>No hay presupuestos internos</h3>
            <p>Comienza agregando tu primer presupuesto interno.</p>
            <button class="add-first-btn" (click)="addBudget()">
              <i class="fas fa-plus"></i>
              Agregar primer presupuesto
            </button>
          </div>

          <div class="budgets-grid" *ngIf="selectedTab === 'clients'">
            <div class="budget-card" *ngFor="let budget of filteredClientBudgets">
              <div class="budget-header">
                <div class="budget-icon">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="budget-info">
                  <h3>{{ budget.name }}</h3>
                  <p class="budget-status">{{ budget.status }}</p>
                </div>
                <div class="budget-actions">
                  <button class="action-btn edit-btn" (click)="editBudget(budget)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteBudget(budget)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="budget-details">
                <div class="detail-item">
                  <span class="detail-label">Importe:</span>
                  <span class="detail-value amount">€{{ budget.amount || '0.00' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Cliente:</span>
                  <span class="detail-value">{{ budget.client || 'Sin cliente' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha:</span>
                  <span class="detail-value">{{ budget.date }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredClientBudgets.length === 0 && selectedTab === 'clients'">
            <i class="fas fa-file-invoice-dollar empty-icon"></i>
            <h3>No hay presupuestos de clientes</h3>
            <p>Comienza agregando tu primer presupuesto para un cliente.</p>
            <button class="add-first-btn" (click)="addBudget()">
              <i class="fas fa-plus"></i>
              Agregar primer presupuesto
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .budgets-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .budgets-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    p { color: #555; margin-bottom: 24px; }
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 14px; transition: all 0.2s ease; }
    .tab.active { background: #111; color: #fff; border-color: #111; }
    .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
    .search-wrap { position: relative; flex-grow: 1; max-width: 400px; }
    .search-input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; }
    .search-input:focus { border-color: #111; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; }
    .add-button { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-button:hover { opacity: 0.9; }
    .budgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .budget-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .budget-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .budget-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .budget-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .budget-icon i { font-size: 20px; color: #6b7280; }
    .budget-info { flex-grow: 1; }
    .budget-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .budget-status { margin: 0; color: #6b7280; font-size: 14px; }
    .budget-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .budget-details { margin-bottom: 16px; }
    .detail-item { display: flex; margin-bottom: 8px; }
    .detail-label { font-weight: 500; color: #6b7280; min-width: 80px; font-size: 14px; }
    .detail-value { color: #111; font-size: 14px; word-break: break-all; }
    .amount { font-weight: 600; color: #2563eb; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0 0 24px 0; color: #9ca3af; }
    .add-first-btn { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-first-btn:hover { opacity: 0.9; }
    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions-bar { flex-direction: column; align-items: stretch; } .search-wrap { max-width: none; } .budgets-grid { grid-template-columns: 1fr; } }
  `]
})
export class BudgetsComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  selectedTab: 'internal' | 'clients' = 'internal';
  budgets = [
    { id: 1, name: 'Renovación Oficina', status: 'Aprobado', amount: '12,500.00', client: 'Inversiones XYZ', date: '10 Mar 2024', type: 'internal' },
    { id: 2, name: 'Marketing Digital', status: 'Pendiente', amount: '8,750.00', client: 'Tech Startup', date: '5 Mar 2024', type: 'internal' }
  ];
  clientBudgets = [
    { id: 3, name: 'Proyecto Q1', status: 'Aprobado', amount: '45,000.00', client: 'Acme Corp', date: '15 Mar 2024', type: 'client' },
    { id: 4, name: 'Desarrollo Web', status: 'Pendiente', amount: '25,000.00', client: 'Startup ABC', date: '20 Mar 2024', type: 'client' }
  ];

  get filteredBudgets() {
    if (!this.searchQuery) return this.budgets;
    return this.budgets.filter(budget => 
      budget.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      budget.client.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      budget.status.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get filteredClientBudgets() {
    if (!this.searchQuery) return this.clientBudgets;
    return this.clientBudgets.filter(budget => 
      budget.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      budget.client.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      budget.status.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
  addBudget() { alert('Agregar nuevo presupuesto'); }
  editBudget(budget: any) { alert(`Editar presupuesto: ${budget.name}`); }
  deleteBudget(budget: any) { if (confirm(`¿Eliminar presupuesto ${budget.name}?`)) { alert(`Eliminar presupuesto: ${budget.name}`); } }
}

