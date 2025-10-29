import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';

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
            <button class="tab" [class.active]="selected === 'roles'" (click)="select('roles')">Roles</button>
            <button class="tab" [class.active]="selected === 'permissions'" (click)="select('permissions')">Permisos</button>
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
            <div class="members-grid">
              <div class="member-card" *ngFor="let member of members">
                <div class="member-avatar">
                  <div class="avatar-circle">{{ member.name.charAt(0) }}</div>
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>
                  <span class="member-status" [class]="'status-' + member.status">{{ member.status }}</span>
                </div>
                <div class="member-actions" *ngIf="!member.isCurrentUser">
                  <button class="action-btn" (click)="editMember(member)">Editar</button>
                  <button class="action-btn danger" (click)="removeMember(member)">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'roles'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar roles..." [(ngModel)]="searchRoles" />
              </div>
              <button class="primary" (click)="addRole()">Crear rol</button>
            </div>
            <p class="muted">Define roles y responsabilidades en tu equipo.</p>
            <div class="roles-grid">
              <div class="role-card" *ngFor="let role of roles">
                <div class="role-header">
                  <h4>{{ role.name }}</h4>
                  <span class="role-count">{{ role.memberCount }} miembros</span>
                </div>
                <p class="role-description">{{ role.description }}</p>
                <div class="role-permissions">
                  <span class="permission-tag" *ngFor="let permission of role.permissions">{{ permission }}</span>
                </div>
                <div class="role-actions">
                  <button class="action-btn" (click)="editRole(role)">Editar</button>
                  <button class="action-btn danger" (click)="deleteRole(role)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'permissions'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar permisos..." [(ngModel)]="searchPermissions" />
              </div>
              <button class="primary" (click)="addPermission()">Nuevo permiso</button>
            </div>
            <p class="muted">Configura los permisos del sistema.</p>
            <div class="permissions-grid">
              <div class="permission-card" *ngFor="let permission of permissions">
                <div class="permission-info">
                  <h4>{{ permission.name }}</h4>
                  <p>{{ permission.description }}</p>
                  <span class="tab-badge">{{ permission.tab }}</span>
                </div>
                <div class="permission-actions">
                  <button class="action-btn" (click)="editPermission(permission)">Editar</button>
                  <button class="action-btn danger" (click)="deletePermission(permission)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'invitations'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar invitaciones..." [(ngModel)]="searchInvitations" />
              </div>
              <button class="primary" (click)="sendInvitation()">Enviar invitación</button>
            </div>
            <p class="muted">Gestiona las invitaciones pendientes y enviadas.</p>
            <div class="invitations-grid">
              <div class="invitation-card" *ngFor="let invitation of invitations">
                <div class="invitation-info">
                  <h4>{{ invitation.email }}</h4>
                  <p>Rol: {{ invitation.role }}</p>
                  <span class="invitation-status" [class]="'status-' + invitation.status">{{ invitation.status }}</span>
                </div>
                <div class="invitation-meta">
                  <span class="invitation-date">{{ invitation.sentDate }}</span>
                  <span class="invitation-expires" *ngIf="invitation.expiresDate">Expira: {{ invitation.expiresDate }}</span>
                </div>
                <div class="invitation-actions">
                  <button class="action-btn" (click)="resendInvitation(invitation)">Reenviar</button>
                  <button class="action-btn danger" (click)="cancelInvitation(invitation)">Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .team-page { width: 100%; height: 100vh; background: white; position: relative; }
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

    .member-card { display: flex; align-items: center; gap: 12px; }
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
    .status-pendiente { background: #fef3c7; color: #d97706; }
    .status-inactivo { background: #fee2e2; color: #dc2626; }
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

    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class TeamComponent implements OnInit {
  showProfile: boolean = false;
  selected: 'members' | 'roles' | 'permissions' | 'invitations' = 'members';
  searchMembers: string = '';
  searchRoles: string = '';
  searchPermissions: string = '';
  searchInvitations: string = '';
  currentUser: User | null = null;
  currentUserName: string = 'Usuario';

  members = [
    { name: 'Usuario', role: 'Administrador', status: 'activo', isCurrentUser: true },
    { name: 'Juan Pérez', role: 'Desarrollador', status: 'activo', isCurrentUser: false },
    { name: 'María García', role: 'Diseñador', status: 'activo', isCurrentUser: false },
    { name: 'Carlos López', role: 'Manager', status: 'pendiente', isCurrentUser: false }
  ];

  roles = [
    { 
      name: 'Administrador', 
      description: 'Acceso completo al sistema', 
      memberCount: 1, 
      permissions: ['Crear', 'Editar', 'Eliminar', 'Configurar'] 
    },
    { 
      name: 'Desarrollador', 
      description: 'Acceso a desarrollo y testing', 
      memberCount: 2, 
      permissions: ['Crear', 'Editar', 'Ver'] 
    },
    { 
      name: 'Diseñador', 
      description: 'Acceso a diseño y contenido', 
      memberCount: 1, 
      permissions: ['Crear', 'Editar', 'Ver'] 
    }
  ];

  permissions = [
    { name: 'Acceso a Roadmap', description: 'Ver y gestionar el roadmap estratégico', tab: 'roadmap' },
    { name: 'Acceso a Tareas', description: 'Gestionar tareas del proyecto', tab: 'tasks' },
    { name: 'Acceso a Mapa', description: 'Ver y usar el mapa de ubicaciones', tab: 'map' },
    { name: 'Acceso a Eventos', description: 'Crear y gestionar eventos', tab: 'events' },
    { name: 'Acceso a Inventario', description: 'Gestionar inventario y productos', tab: 'inventory' },
    { name: 'Acceso a Proveedores', description: 'Gestionar proveedores y contactos', tab: 'suppliers' },
    { name: 'Acceso a Clientes', description: 'Gestionar clientes y leads', tab: 'customers' },
    { name: 'Acceso a Marketing', description: 'Gestionar campañas y analíticas', tab: 'marketing' },
    { name: 'Acceso a Equipo', description: 'Gestionar miembros del equipo', tab: 'team' },
    { name: 'Acceso a Facturas', description: 'Gestionar facturas y pagos', tab: 'invoices' },
    { name: 'Acceso a Estadísticas', description: 'Ver reportes y métricas', tab: 'statistics' }
  ];

  invitations = [
    { email: 'ana@empresa.com', role: 'Desarrollador', status: 'enviada', sentDate: '2024-01-15', expiresDate: '2024-01-22' },
    { email: 'pedro@empresa.com', role: 'Diseñador', status: 'aceptada', sentDate: '2024-01-10' },
    { email: 'laura@empresa.com', role: 'Manager', status: 'expirada', sentDate: '2024-01-01', expiresDate: '2024-01-08' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.currentUserName = user.displayName || user.email?.split('@')[0] || 'Usuario';
        // Actualizar el primer miembro con los datos del usuario actual
        this.members[0].name = this.currentUserName;
      }
    });
  }

  select(section: 'members' | 'roles' | 'permissions' | 'invitations') { this.selected = section; }

  inviteMember() { alert('Invitar miembro'); }
  editMember(member: any) { 
    if (member.isCurrentUser) {
      alert('No puedes editar tu propio perfil desde aquí. Ve a tu perfil personal.');
      return;
    }
    alert('Editar miembro: ' + member.name); 
  }
  removeMember(member: any) { 
    if (member.isCurrentUser) {
      alert('No puedes eliminarte a ti mismo del equipo.');
      return;
    }
    alert('Eliminar miembro: ' + member.name); 
  }

  addRole() { alert('Crear rol'); }
  editRole(role: any) { alert('Editar rol: ' + role.name); }
  deleteRole(role: any) { alert('Eliminar rol: ' + role.name); }

  addPermission() { alert('Nuevo permiso'); }
  editPermission(permission: any) { alert('Editar permiso: ' + permission.name); }
  deletePermission(permission: any) { alert('Eliminar permiso: ' + permission.name); }

  sendInvitation() { alert('Enviar invitación'); }
  resendInvitation(invitation: any) { alert('Reenviar invitación a: ' + invitation.email); }
  cancelInvitation(invitation: any) { alert('Cancelar invitación a: ' + invitation.email); }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}
