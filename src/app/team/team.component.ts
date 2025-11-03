import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';
import { ProjectContextService } from '../services/project-context.service';
import { InvitationsService, InvitationDto } from '../services/invitations.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="team-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="team-container">
          <h2>Equipo</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'members'" (click)="select('members')">Miembros</button>
            <button class="tab" [class.active]="selected === 'invitations'" (click)="select('invitations')">Invitaciones</button>
          </div>

          <div class="section" *ngIf="selected === 'members'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar miembros..." [(ngModel)]="searchMembers" />
              </div>
              <button class="primary" (click)="inviteMember()">Invitar miembro</button>
            </div>
            <p class="muted">Gestiona los miembros de tu equipo.</p>
            <div class="members-grid" *ngIf="!loading; else loadingState">
              <div class="member-card" *ngFor="let member of members">
                <div class="member-header">
                  <div class="member-avatar">
                    <div class="avatar-circle">{{ member.nombre?.charAt(0) || 'U' }}</div>
                  </div>
                  <div class="member-info">
                    <h4>{{ member.nombre }}</h4>
                    <p>{{ member.email }}</p>
                    <span class="member-status" [class.status-activo]="member.isOwner" [class.status-owner]="member.isOwner">
                      {{ member.isOwner ? 'Propietario' : 'Miembro' }}
                    </span>
                  </div>
                </div>
                <div class="member-permissions" *ngIf="!member.isOwner">
                  <div class="permissions-title">Permisos de acceso:</div>
                  <div class="permissions-checkboxes">
                    <label class="checkbox-label" *ngFor="let tab of availableTabs">
                      <input type="checkbox" [checked]="member.allowedTabs?.includes(tab.key)" (change)="toggleTabPermission(member, tab.key, $event)" />
                      <span>{{ tab.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="empty-state" *ngIf="members.length === 0">
                <p>No hay miembros en el equipo aún.</p>
              </div>
            </div>
            <ng-template #loadingState>
              <div class="empty-state">
                <div class="spinner"></div>
              </div>
            </ng-template>
            <div class="error" *ngIf="error">{{ error }}</div>
          </div>

          <div class="section" *ngIf="selected === 'invitations'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar invitaciones..." [(ngModel)]="searchInvitations" />
              </div>
              <button class="primary" (click)="inviteMember()">Enviar invitación</button>
            </div>
            <p class="muted">Gestiona las invitaciones pendientes.</p>
            <div class="invitations-grid" *ngIf="!loadingInvitations; else loadingInvitationsState">
              <div class="invitation-card" *ngFor="let invitation of invitations">
                <div class="invitation-info">
                  <h4>{{ invitation.inviteeEmail }}</h4>
                  <p>Invitado por: {{ invitation.inviterEmail }}</p>
                  <span class="invitation-status status-enviada">Pendiente</span>
                </div>
                <div class="invitation-meta">
                  <span class="invitation-date">{{ invitation.createdAt | date:'short' }}</span>
                </div>
                <div class="invitation-actions">
                  <button class="action-btn danger" (click)="cancelInvitation(invitation)">Cancelar</button>
                </div>
              </div>
              <div class="empty-state" *ngIf="invitations.length === 0">
                <p>No hay invitaciones pendientes.</p>
              </div>
            </div>
            <ng-template #loadingInvitationsState>
              <div class="empty-state">
                <div class="spinner"></div>
              </div>
            </ng-template>
          </div>

          <!-- Modal de invitación -->
          <div class="modal-backdrop" *ngIf="showInviteModal" (click)="closeInviteModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>Invitar miembro</h3>
              <div class="modal-form">
                <div class="form-group">
                  <label>Email del miembro *</label>
                  <input type="email" [(ngModel)]="inviteEmail" placeholder="usuario@ejemplo.com" />
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeInviteModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="sendInvitation()" [disabled]="!inviteEmail || loading">
                  {{ loading ? 'Enviando...' : 'Enviar invitación' }}
                </button>
              </div>
              <span class="error" *ngIf="inviteError">{{ inviteError }}</span>
            </div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .team-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .team-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; }
    .muted { color: #555; font-size: 13px; margin: 0 0 8px 0; }

    .tabs { display: flex; gap: 8px; margin: 8px 0 24px 0; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
    .tab.active { background: #111; color: #fff; border-color: #111; }

    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 12px 0; }
    .search { min-width: 240px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; outline: none; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .members-grid, .roles-grid, .permissions-grid, .invitations-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
      gap: 16px; 
      margin-top: 16px; 
    }

    .member-card, .role-card, .permission-card, .invitation-card { 
      background: #fff; 
      border: 1px solid #ddd; 
      border-radius: 10px; 
      padding: 16px; 
    }

    .member-card { display: flex; flex-direction: column; gap: 12px; }
    .member-header { display: flex; align-items: center; gap: 12px; }
    .member-avatar { flex-shrink: 0; }
    .avatar-circle { 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      background: #111; 
      color: white; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 600; 
      font-size: 14px; 
    }
    .member-info { flex-grow: 1; }
    .member-info h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; }
    .member-info p { margin: 0 0 4px 0; font-size: 12px; color: #666; }
    .member-status { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .status-activo { background: #d1fae5; color: #059669; }
    .status-owner { background: #dbeafe; color: #2563eb; }
    .status-pendiente { background: #fef3c7; color: #d97706; }
    .status-inactivo { background: #fee2e2; color: #dc2626; }
    .member-permissions { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }
    .permissions-title { font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #374151; }
    .permissions-checkboxes { display: flex; flex-direction: column; gap: 6px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; }
    .checkbox-label input[type="checkbox"] { cursor: pointer; }
    .checkbox-label span { color: #374151; }
    .member-actions { display: flex; gap: 8px; }
    .action-btn { 
      padding: 4px 8px; 
      border: 1px solid #ddd; 
      background: #fff; 
      border-radius: 4px; 
      font-size: 11px; 
      cursor: pointer; 
    }
    .action-btn.danger { border-color: #dc2626; color: #dc2626; }
    .action-btn:hover { background: #f5f5f5; }
    .action-btn.disabled { 
      opacity: 0.5; 
      cursor: not-allowed; 
      background: #f5f5f5; 
      color: #999; 
      border-color: #ddd; 
    }
    .action-btn.disabled:hover { background: #f5f5f5; }

    .role-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .role-header h4 { margin: 0; font-size: 14px; font-weight: 600; }
    .role-count { font-size: 11px; color: #666; }
    .role-description { font-size: 12px; color: #666; margin: 0 0 8px 0; }
    .role-permissions { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
    .permission-tag { 
      background: #f0f0f0; 
      color: #333; 
      padding: 2px 6px; 
      border-radius: 8px; 
      font-size: 10px; 
    }
    .role-actions { display: flex; gap: 8px; }

    .permission-info h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; }
    .permission-info p { margin: 0 0 8px 0; font-size: 12px; color: #666; }
    .tab-badge { 
      background: #f0f0f0; 
      color: #333; 
      padding: 2px 8px; 
      border-radius: 12px; 
      font-size: 10px; 
      font-weight: 500;
      text-transform: uppercase;
    }
    .permission-actions { display: flex; gap: 8px; margin-top: 8px; }

    .invitation-info h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; }
    .invitation-info p { margin: 0 0 4px 0; font-size: 12px; color: #666; }
    .invitation-status { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .status-enviada { background: #dbeafe; color: #2563eb; }
    .status-aceptada { background: #d1fae5; color: #059669; }
    .status-expirada { background: #fee2e2; color: #dc2626; }
    .invitation-meta { margin-top: 8px; }
    .invitation-date, .invitation-expires { font-size: 10px; color: #999; display: block; }
    .invitation-actions { display: flex; gap: 8px; margin-top: 8px; }

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
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 480px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
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
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
    }
    .form-group input:focus {
      border-color: #111;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .modal-btn {
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      border: none;
      transition: opacity 0.2s ease;
    }
    .cancel-btn {
      background: #f3f4f6;
      color: #374151;
    }
    .cancel-btn:hover {
      opacity: 0.8;
    }
    .primary-btn {
      background: #111;
      color: white;
    }
    .primary-btn:hover {
      opacity: 0.9;
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
      padding: 40px 20px;
      text-align: center;
      color: #6b7280;
    }
    .empty-state p {
      margin: 0;
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #eee;
      border-top-color: #111;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 12px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class TeamComponent implements OnInit {
  showProfile: boolean = false;
  selected: 'members' | 'invitations' = 'members';
  searchMembers: string = '';
  searchInvitations: string = '';
  currentUser: User | null = null;
  currentUserName: string = 'Usuario';
  currentUserEmail: string = '';
  currentProjectId: string | null = null;
  loading: boolean = false;
  loadingInvitations: boolean = false;
  error: string = '';

  members: any[] = [];
  invitations: InvitationDto[] = [];
  availableTabs: { key: string; label: string }[] = [
    { key: 'roadmap', label: 'Roadmap' },
    { key: 'statistics', label: 'Estadísticas' },
    { key: 'map', label: 'Mapa' },
    { key: 'inventory', label: 'Inventario' },
    { key: 'customers', label: 'Clientes' },
    { key: 'tasks', label: 'Tareas' },
    { key: 'events', label: 'Eventos' },
    { key: 'meetings', label: 'Reuniones' },
    { key: 'credentials', label: 'Credenciales' },
    { key: 'technology', label: 'Tecnología' },
    { key: 'documents', label: 'Documentos' },
    { key: 'invoices', label: 'Facturas' },
    { key: 'financials', label: 'Movimientos' },
    { key: 'budgets', label: 'Presupuestos' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'rnd', label: 'I+D' },
    { key: 'legal', label: 'Legal' }
  ];

  // Modal de invitación
  showInviteModal: boolean = false;
  inviteEmail: string = '';
  inviteError: string = '';

  constructor(
    private authService: AuthService,
    private projectCtx: ProjectContextService,
    private invitationsService: InvitationsService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user && user.email) {
        this.currentUserEmail = user.email;
        this.currentUserName = user.displayName || user.email.split('@')[0] || 'Usuario';
      }
    });

    // Cargar datos del proyecto actual
    const currentProject = this.projectCtx.getCurrent();
    if (currentProject && (currentProject as any)._id) {
      this.currentProjectId = (currentProject as any)._id;
      this.loadTeamData();
    }
  }

  loadTeamData() {
    if (!this.currentProjectId) return;
    
    // Cargar miembros
    this.loading = true;
    this.invitationsService.getProjectMembers(this.currentProjectId).subscribe({
      next: (membersList) => {
        this.members = membersList || [];
        this.loading = false;
      },
      error: (e) => {
        console.error('Error cargando miembros:', e);
        this.error = 'Error al cargar miembros del equipo';
        this.loading = false;
      }
    });

    // Cargar invitaciones pendientes
    this.loadingInvitations = true;
    this.invitationsService.getInvitationsByProject(this.currentProjectId).subscribe({
      next: (invList) => {
        this.invitations = invList || [];
        this.loadingInvitations = false;
      },
      error: (e) => {
        console.error('Error cargando invitaciones:', e);
        this.loadingInvitations = false;
      }
    });
  }

  select(section: 'members' | 'invitations') { this.selected = section; }

  inviteMember() {
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.inviteError = '';
  }

  closeInviteModal() {
    this.showInviteModal = false;
    this.inviteEmail = '';
    this.inviteError = '';
  }

  sendInvitation() {
    if (!this.inviteEmail || !this.currentProjectId || !this.currentUserEmail) {
      this.inviteError = 'Email requerido';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.inviteEmail)) {
      this.inviteError = 'Email no válido';
      return;
    }

    this.loading = true;
    this.inviteError = '';

    console.log('Enviando invitación con:', {
      projectId: this.currentProjectId,
      inviterEmail: this.currentUserEmail,
      inviteeEmail: this.inviteEmail
    });

    this.invitationsService.createInvitation({
      projectId: this.currentProjectId,
      inviterEmail: this.currentUserEmail,
      inviteeEmail: this.inviteEmail
    }).subscribe({
      next: () => {
        console.log('Invitación enviada');
        this.loading = false;
        this.closeInviteModal();
        this.loadTeamData(); // Recargar datos
      },
      error: (e: any) => {
        console.error('Error enviando invitación:', e);
        console.error('Error details:', e.error);
        this.inviteError = e.error?.error || 'Error al enviar la invitación';
        this.loading = false;
      }
    });
  }

  cancelInvitation(invitation: InvitationDto) {
    if (!confirm('¿Seguro que quieres cancelar esta invitación?')) return;
    // Nota: No hay endpoint para cancelar, pero podríamos implementarlo o simplemente marcar como rejected
    alert('Funcionalidad de cancelar aún no implementada');
  }

  toggleTabPermission(member: any, tabKey: string, event: Event) {
    if (!this.currentProjectId || !member.email) return;
    
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    
    // Actualizar localmente
    if (!member.allowedTabs) {
      member.allowedTabs = [];
    }
    
    if (isChecked) {
      if (!member.allowedTabs.includes(tabKey)) {
        member.allowedTabs.push(tabKey);
      }
    } else {
      member.allowedTabs = member.allowedTabs.filter((t: string) => t !== tabKey);
    }
    
    // Guardar en backend
    this.invitationsService.updateMemberPermissions(
      this.currentProjectId,
      member.email,
      member.allowedTabs
    ).subscribe({
      next: () => {
        console.log('Permisos actualizados');
      },
      error: (err) => {
        console.error('Error actualizando permisos:', err);
        // Revertir el cambio local
        checkbox.checked = !isChecked;
        if (isChecked) {
          member.allowedTabs = member.allowedTabs.filter((t: string) => t !== tabKey);
        } else {
          member.allowedTabs.push(tabKey);
        }
      }
    });
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}
