import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="credentials-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="credentials-container">
          <h2>Credenciales</h2>
          <p>Gestiona tus credenciales de diferentes servicios.</p>
          
          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar credenciales..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addCredential()">
              <i class="fas fa-plus"></i>
              Nueva credencial
            </button>
          </div>

          <div class="credentials-grid">
            <div class="credential-card" *ngFor="let credential of filteredCredentials">
              <div class="credential-header">
                <div class="credential-icon">
                  <i [class]="getTechnologyIcon(credential.technology)"></i>
                </div>
                <div class="credential-info">
                  <h3>{{ credential.name }}</h3>
                  <p class="credential-email">{{ credential.email }}</p>
                </div>
                <div class="credential-actions">
                  <button class="action-btn edit-btn" (click)="editCredential(credential)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteCredential(credential)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="credential-details">
                <div class="detail-item">
                  <span class="detail-label">Tecnología:</span>
                  <span class="detail-value">{{ credential.technology }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">URL:</span>
                  <span class="detail-value">{{ credential.url || 'No especificada' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Notas:</span>
                  <span class="detail-value">{{ credential.notes || 'Sin notas' }}</span>
                </div>
              </div>
              <div class="password-section">
                <button class="show-password-btn" (click)="togglePassword(credential)">
                  <i class="fas" [class.fa-eye]="!credential.showPassword" [class.fa-eye-slash]="credential.showPassword"></i>
                  {{ credential.showPassword ? 'Ocultar' : 'Mostrar' }} contraseña
                </button>
                <div class="password-display" *ngIf="credential.showPassword">
                  {{ credential.password }}
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredCredentials.length === 0">
            <i class="fas fa-key empty-icon"></i>
            <h3>No hay credenciales registradas</h3>
            <p>Comienza agregando tu primera credencial.</p>
            <button class="add-first-btn" (click)="addCredential()">
              <i class="fas fa-plus"></i>
              Agregar primera credencial
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .credentials-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .credentials-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    p { color: #555; margin-bottom: 24px; }
    
    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }
    .search-wrap {
      position: relative;
      flex-grow: 1;
      max-width: 400px;
    }
    .search-input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .search-input:focus {
      border-color: #111;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #888;
    }
    .add-button {
      background-color: #111;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 20px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s ease;
    }
    .add-button:hover {
      opacity: 0.9;
    }

    .credentials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .credential-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .credential-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .credential-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .credential-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .credential-icon i {
      font-size: 20px;
      color: #6b7280;
    }
    .credential-info {
      flex-grow: 1;
    }
    .credential-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111;
    }
    .credential-email {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }
    .credential-actions {
      display: flex;
      gap: 8px;
    }
    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
    }
    .edit-btn {
      background: #f3f4f6;
      color: #6b7280;
    }
    .edit-btn:hover {
      background: #e5e7eb;
    }
    .delete-btn {
      background: #fef2f2;
      color: #ef4444;
    }
    .delete-btn:hover {
      background: #fee2e2;
    }

    .credential-details {
      margin-bottom: 16px;
    }
    .detail-item {
      display: flex;
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: 500;
      color: #6b7280;
      min-width: 80px;
      font-size: 14px;
    }
    .detail-value {
      color: #111;
      font-size: 14px;
      word-break: break-all;
    }

    .password-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
    }
    .show-password-btn {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      transition: color 0.2s ease;
    }
    .show-password-btn:hover {
      color: #111;
    }
    .password-display {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px 12px;
      font-family: monospace;
      font-size: 14px;
      color: #111;
      word-break: break-all;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6b7280;
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #d1d5db;
    }
    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #6b7280;
    }
    .empty-state p {
      margin: 0 0 24px 0;
      color: #9ca3af;
    }
    .add-first-btn {
      background-color: #111;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s ease;
    }
    .add-first-btn:hover {
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
      .actions-bar { flex-direction: column; align-items: stretch; }
      .search-wrap { max-width: none; }
      .credentials-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CredentialsComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  
  credentials = [
    {
      id: 1,
      name: 'GitHub',
      email: 'usuario@ejemplo.com',
      password: 'mi_password_seguro',
      technology: 'Git',
      url: 'https://github.com',
      notes: 'Cuenta principal de desarrollo',
      showPassword: false
    },
    {
      id: 2,
      name: 'AWS',
      email: 'admin@empresa.com',
      password: 'aws_password_123',
      technology: 'Cloud',
      url: 'https://aws.amazon.com',
      notes: 'Servicios de infraestructura',
      showPassword: false
    },
    {
      id: 3,
      name: 'Stripe',
      email: 'billing@empresa.com',
      password: 'stripe_key_456',
      technology: 'Payment',
      url: 'https://stripe.com',
      notes: 'Procesamiento de pagos',
      showPassword: false
    }
  ];

  get filteredCredentials() {
    if (!this.searchQuery) return this.credentials;
    return this.credentials.filter(credential => 
      credential.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      credential.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      credential.technology.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getTechnologyIcon(technology: string): string {
    const icons: { [key: string]: string } = {
      'Git': 'fab fa-git-alt',
      'Cloud': 'fas fa-cloud',
      'Payment': 'fas fa-credit-card',
      'Database': 'fas fa-database',
      'Email': 'fas fa-envelope',
      'Social': 'fas fa-share-alt',
      'Development': 'fas fa-code',
      'Design': 'fas fa-palette',
      'Marketing': 'fas fa-chart-line',
      'Other': 'fas fa-key'
    };
    return icons[technology] || icons['Other'];
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }

  addCredential() {
    alert('Agregar nueva credencial');
  }

  editCredential(credential: any) {
    alert(`Editar credencial: ${credential.name}`);
  }

  deleteCredential(credential: any) {
    if (confirm(`¿Eliminar credencial ${credential.name}?`)) {
      alert(`Eliminar credencial: ${credential.name}`);
    }
  }

  togglePassword(credential: any) {
    credential.showPassword = !credential.showPassword;
  }
}
