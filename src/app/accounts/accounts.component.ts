import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="accounts-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="accounts-container">
          <h2>Movimientos</h2>
          <p>Gestiona los ingresos, gastos y beneficios de tu proyecto.</p>
          
          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar cuentas..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addAccount()">
              <i class="fas fa-plus"></i>
              Nueva cuenta
            </button>
          </div>

          <div class="accounts-grid">
            <div class="account-card" *ngFor="let account of filteredAccounts">
              <div class="account-header">
                <div class="account-icon">
                  <i class="fas fa-university"></i>
                </div>
                <div class="account-info">
                  <h3>{{ account.name }}</h3>
                  <p class="account-type">{{ account.type }}</p>
                </div>
                <div class="account-actions">
                  <button class="action-btn edit-btn" (click)="editAccount(account)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteAccount(account)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="account-details">
                <div class="detail-item">
                  <span class="detail-label">Banco:</span>
                  <span class="detail-value">{{ account.bank }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Número:</span>
                  <span class="detail-value">{{ account.number || 'No especificado' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Balance:</span>
                  <span class="detail-value balance">€{{ account.balance || '0.00' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredAccounts.length === 0">
            <i class="fas fa-university empty-icon"></i>
            <h3>No hay cuentas registradas</h3>
            <p>Comienza agregando tu primera cuenta financiera.</p>
            <button class="add-first-btn" (click)="addAccount()">
              <i class="fas fa-plus"></i>
              Agregar primera cuenta
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .accounts-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .accounts-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    p { color: #555; margin-bottom: 24px; }
    .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
    .search-wrap { position: relative; flex-grow: 1; max-width: 400px; }
    .search-input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; }
    .search-input:focus { border-color: #111; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; }
    .add-button { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-button:hover { opacity: 0.9; }
    .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .account-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .account-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .account-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .account-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .account-icon i { font-size: 20px; color: #6b7280; }
    .account-info { flex-grow: 1; }
    .account-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .account-type { margin: 0; color: #6b7280; font-size: 14px; }
    .account-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .account-details { margin-bottom: 16px; }
    .detail-item { display: flex; margin-bottom: 8px; }
    .detail-label { font-weight: 500; color: #6b7280; min-width: 80px; font-size: 14px; }
    .detail-value { color: #111; font-size: 14px; word-break: break-all; }
    .balance { font-weight: 600; color: #059669; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0 0 24px 0; color: #9ca3af; }
    .add-first-btn { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-first-btn:hover { opacity: 0.9; }
    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions-bar { flex-direction: column; align-items: stretch; } .search-wrap { max-width: none; } .accounts-grid { grid-template-columns: 1fr; } }
  `]
})
export class AccountsComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  accounts = [
    { id: 1, name: 'Cuenta Principal', type: 'Corriente', bank: 'Banco Santander', number: 'ES91 2100 0418 4502 0005 1332', balance: '12,450.50' },
    { id: 2, name: 'Cuenta Ahorro', type: 'Ahorro', bank: 'BBVA', number: 'ES89 2095 0001 40 3050 0004', balance: '5,200.00' },
    { id: 3, name: 'Cuenta Empresa', type: 'Corriente', bank: 'CaixaBank', number: 'ES80 2085 0000 8303 0052 7123', balance: '28,900.75' }
  ];

  get filteredAccounts() {
    if (!this.searchQuery) return this.accounts;
    return this.accounts.filter(account => 
      account.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      account.bank.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      account.type.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
  addAccount() { alert('Agregar nueva cuenta'); }
  editAccount(account: any) { alert(`Editar cuenta: ${account.name}`); }
  deleteAccount(account: any) { if (confirm(`¿Eliminar cuenta ${account.name}?`)) { alert(`Eliminar cuenta: ${account.name}`); } }
}

