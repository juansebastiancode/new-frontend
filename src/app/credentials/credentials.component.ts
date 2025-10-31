import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { CredentialsService, CredentialDto } from '../services/credentials.service';
import { ProjectContextService } from '../services/project-context.service';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <div class="credentials-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="credentials-container">
          <h2>Credenciales</h2>
          <p>Gestiona tus credenciales de diferentes servicios. <strong>Las contraseñas se encriptan automáticamente en la base de datos.</strong></p>
          
          <div class="actions">
            <div class="search-wrap">
              <i class="fas fa-search search-icon"></i>
              <input class="search" type="text" placeholder="Buscar credenciales..." [(ngModel)]="searchQuery" />
            </div>
            <button class="primary" (click)="addCredential()">Añadir credencial</button>
          </div>

          <div class="credentials-grid">
            <div class="credential-card" *ngFor="let credential of filteredCredentials">
              <div class="credential-header">
                <div class="credential-icon">
                  <i [class]="getTechnologyIcon(credential.technology || 'Other')"></i>
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
                <div class="encryption-info">
                  <i class="fas fa-lock"></i>
                  <span>Contraseña encriptada en la base de datos</span>
                </div>
                <button class="show-password-btn" (click)="togglePassword(credential)" [disabled]="credential.loadingPassword">
                  <i class="fas" [class.fa-eye]="!credential.showPassword" [class.fa-eye-slash]="credential.showPassword"></i>
                  {{ credential.loadingPassword ? 'Cargando...' : (credential.showPassword ? 'Ocultar' : 'Mostrar') }} contraseña
                </button>
                <div class="password-display" *ngIf="credential.showPassword">
                  <span *ngIf="credential.password !== undefined && credential.password !== null">{{ credential.password }}</span>
                  <span *ngIf="credential.password === undefined || credential.password === null" class="password-error">Error al cargar contraseña</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredCredentials.length === 0">
            <i class="fas fa-key empty-icon"></i>
            <h3>No hay credenciales registradas</h3>
            <p>Comienza agregando tu primera credencial.</p>
          </div>

          <!-- Modal añadir/editar credencial -->
          <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>{{ editing ? 'Editar credencial' : 'Nueva credencial' }}</h3>
              <div class="modal-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" [(ngModel)]="form.name" placeholder="Ej: GitHub" />
                  </div>
                  <div class="form-group">
                    <label>Email *</label>
                    <input type="email" [(ngModel)]="form.email" placeholder="usuario@ejemplo.com" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Contraseña * <span class="encrypt-note">(se encriptará automáticamente)</span></label>
                  <div class="password-input-wrapper">
                    <input [type]="showPasswordInForm ? 'text' : 'password'" [(ngModel)]="form.password" placeholder="Tu contraseña" [disabled]="loadingPassword" />
                    <button type="button" class="toggle-password-btn" (click)="showPasswordInForm = !showPasswordInForm" [disabled]="loadingPassword">
                      <i class="fas" [class.fa-eye]="!showPasswordInForm" [class.fa-eye-slash]="showPasswordInForm"></i>
                    </button>
                  </div>
                  <span *ngIf="loadingPassword" class="loading-text">Cargando contraseña...</span>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Tecnología</label>
                    <select [(ngModel)]="form.technology">
                      <option value="Other">Otra</option>
                      <option value="Git">Git</option>
                      <option value="Cloud">Cloud</option>
                      <option value="Payment">Pago</option>
                      <option value="Database">Base de datos</option>
                      <option value="Email">Email</option>
                      <option value="Social">Social</option>
                      <option value="Development">Desarrollo</option>
                      <option value="Design">Diseño</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>URL</label>
                    <input type="url" [(ngModel)]="form.url" placeholder="https://..." />
                  </div>
                </div>
                <div class="form-group">
                  <label>Notas</label>
                  <textarea rows="3" [(ngModel)]="form.notes" placeholder="Notas adicionales..."></textarea>
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="saveCredential()" [disabled]="!form.name || !form.email || !form.password || loading">
                  {{ loading ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
              <span class="error" *ngIf="error">{{ error }}</span>
            </div>
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
    
    .actions {
      display: flex;
      gap: 10px;
      align-items: center;
      margin: 16px 0 20px 0;
    }
    .search-wrap {
      position: relative;
    }
    .search {
      min-width: 420px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px 12px 10px 36px;
      outline: none;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      font-size: 14px;
    }
    .primary {
      background: #111;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 14px;
      cursor: pointer;
    }
    .primary:hover {
      opacity: .92;
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
    .encryption-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #059669;
      margin-bottom: 8px;
    }
    .encryption-info i {
      font-size: 11px;
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
    .show-password-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-content h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .modal-form {
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
    .encrypt-note {
      font-size: 11px;
      color: #059669;
      font-weight: normal;
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
    }
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      border-color: #111;
    }
    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .password-input-wrapper input {
      padding-right: 40px;
    }
    .toggle-password-btn {
      position: absolute;
      right: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      transition: color 0.2s ease;
    }
    .toggle-password-btn:hover {
      color: #111;
    }
    .toggle-password-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .toggle-password-btn i {
      font-size: 14px;
    }
    .loading-text {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .modal-btn {
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      border: none;
    }
    .cancel-btn {
      background: #f3f4f6;
      color: #333;
    }
    .primary-btn {
      background: #111;
      color: #fff;
    }
    .primary-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .error {
      color: #dc2626;
      font-size: 14px;
      display: block;
      margin-top: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 120px 20px 60px 20px;
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
      margin: 0;
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
      .actions { flex-direction: column; align-items: stretch; }
      .search { min-width: 100%; }
      .credentials-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CredentialsComponent implements OnInit {
  showProfile: boolean = false;
  searchQuery: string = '';
  credentials: (CredentialDto & { showPassword?: boolean; loadingPassword?: boolean; password?: string })[] = [];
  loading: boolean = false;
  loadingPassword: boolean = false;
  showPasswordInForm: boolean = false;
  error: string = '';
  showModal: boolean = false;
  editing: CredentialDto | null = null;
  form: any = { name: '', email: '', password: '', technology: 'Other', url: '', notes: '' };

  constructor(
    private credentialsService: CredentialsService,
    private projectCtx: ProjectContextService
  ) {}

  ngOnInit() {
    this.loadCredentials();
  }

  get projectId(): string | null {
    const currentProject = this.projectCtx.getCurrent();
    return (currentProject as any)?._id || null;
  }

  get filteredCredentials() {
    if (!this.searchQuery) return this.credentials;
    return this.credentials.filter(credential => 
      credential.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      credential.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (credential.technology || '').toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  loadCredentials() {
    if (!this.projectId) {
      console.warn('No hay proyecto seleccionado');
      return;
    }
    this.loading = true;
    this.credentialsService.list(this.projectId).subscribe({
      next: (list) => {
        this.credentials = list.map(c => ({ ...c, showPassword: false, loadingPassword: false }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al cargar credenciales';
      }
    });
  }

  getTechnologyIcon(technology: string | undefined): string {
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
    return icons[technology || 'Other'] || icons['Other'];
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }

  addCredential() {
    this.editing = null;
    this.form = { name: '', email: '', password: '', technology: 'Other', url: '', notes: '' };
    this.error = '';
    this.showModal = true;
  }

  editCredential(credential: CredentialDto) {
    this.editing = credential;
    this.form = {
      name: credential.name,
      email: credential.email,
      password: '', // Se cargará desde el servidor
      technology: credential.technology || 'Other',
      url: credential.url || '',
      notes: credential.notes || ''
    };
    this.error = '';
    this.showModal = true;
    
    // Cargar la contraseña desencriptada del servidor
    if (credential._id) {
      this.loadingPassword = true;
      this.credentialsService.getPassword(credential._id).subscribe({
        next: (response) => {
          if (response && response.password) {
            this.form.password = response.password;
          }
          this.loadingPassword = false;
        },
        error: (err) => {
          console.error('Error cargando contraseña para editar:', err);
          // No mostrar error fatal, solo dejar el campo vacío
          this.loadingPassword = false;
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editing = null;
    this.error = '';
    this.showPasswordInForm = false;
    this.form = { name: '', email: '', password: '', technology: 'Other', url: '', notes: '' };
  }

  saveCredential() {
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.error = 'Nombre, email y contraseña son obligatorios';
      return;
    }
    const pid = this.projectId;
    if (!pid) {
      this.error = 'No hay proyecto seleccionado';
      return;
    }

    this.loading = true;
    this.error = '';

    const credentialData = {
      projectId: pid,
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      technology: this.form.technology || 'Other',
      url: this.form.url || '',
      notes: this.form.notes || ''
    };

    const operation = this.editing
      ? this.credentialsService.update(this.editing._id!, credentialData)
      : this.credentialsService.create(credentialData);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.closeModal();
        this.loadCredentials();
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al guardar credencial';
      }
    });
  }

  deleteCredential(credential: CredentialDto) {
    if (!credential._id) return;
    if (!confirm(`¿Eliminar credencial ${credential.name}?`)) return;

    this.credentialsService.delete(credential._id).subscribe({
      next: () => {
        this.loadCredentials();
      },
      error: () => {
        this.error = 'Error al eliminar credencial';
      }
    });
  }

  togglePassword(credential: any) {
    if (credential.showPassword) {
      credential.showPassword = false;
      credential.password = undefined;
      return;
    }

    if (!credential._id) {
      console.error('No hay _id en la credencial');
      return;
    }

    // Encontrar el índice en el array
    const index = this.credentials.findIndex(c => c._id === credential._id);
    if (index === -1) {
      console.error('Credencial no encontrada en el array');
      return;
    }

    this.credentials[index].loadingPassword = true;
    console.log('Solicitando contraseña para credencial:', credential._id);
    this.credentialsService.getPassword(credential._id).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response && response.password !== undefined && response.password !== null && response.password !== '') {
          // Actualizar el objeto en el array
          this.credentials[index] = {
            ...this.credentials[index],
            password: response.password,
            showPassword: true,
            loadingPassword: false
          };
          console.log('Contraseña establecida:', this.credentials[index].password);
        } else {
          console.error('Respuesta inválida o contraseña vacía:', response);
          this.credentials[index].loadingPassword = false;
          this.error = 'No se recibió la contraseña del servidor o está vacía';
        }
      },
      error: (err) => {
        console.error('Error obteniendo contraseña:', err);
        this.credentials[index].loadingPassword = false;
        this.error = 'Error al obtener contraseña: ' + (err.error?.error || err.message || 'Error desconocido');
      }
    });
  }
}
