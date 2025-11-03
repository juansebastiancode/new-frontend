import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ProjectService, ProjectDto } from '../services/project.service';
import { ProjectContextService } from '../services/project-context.service';
import { ProfileComponent } from '../profile/profile.component';
import { InvitationsService, InvitationDto } from '../services/invitations.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  showProfile: boolean = false;
  activeTab: 'projects' | 'invitations' = 'projects';
  searchQuery: string = '';
  searchHint: string = '';
  showCreateModal: boolean = false;
  projectName: string = '';
  projectSector: string = '';
  projects: ProjectDto[] = [];
  invitedProjects: ProjectDto[] = [];
  invitations: InvitationDto[] = [];
  mongoUserId: string = '';
  loadingProjects: boolean = false;
  loadingInvitations: boolean = false;
  currentUserEmail: string = '';
  loadError: string = '';
  openDropdownId: string | null = null;
  // Usuario (header)
  userName: string = 'Usuario';
  userInitial: string = 'U';
  imageError: boolean = false;
  showUserDropdown: boolean = false;

  constructor(public auth: AuthService, private projectService: ProjectService, private userService: UserService, private router: Router, private projectCtx: ProjectContextService, private invitationsService: InvitationsService) {
    const user = this.auth.getCurrentUser();
    if (user && user.email) {
      this.currentUserEmail = user.email;
      this.userName = user.displayName || user.email.split('@')[0] || 'Usuario';
      this.userInitial = this.userName.charAt(0).toUpperCase();
      
      // Cargar invitaciones
      this.loadInvitations(user.email);
      
      // Activar loading inmediatamente para evitar parpadeos en UI
      this.loadingProjects = true;
      this.userService.getUserByEmail(user.email).subscribe({
        next: (resp: any) => {
          this.mongoUserId = resp?.user?._id || '';
          console.log('mongoUserId cargado:', this.mongoUserId);
          // Si el backend pobló proyectos, úsalo directamente
          const populated = resp?.user?.proyectos;
          if (Array.isArray(populated)) {
            this.projects = populated;
            this.loadingProjects = false;
          } else if (this.mongoUserId) {
            this.loadProjects(this.mongoUserId);
          }
          // Cargar proyectos invitados
          const populatedInvited = resp?.user?.proyectosInvitados;
          if (Array.isArray(populatedInvited)) {
            this.invitedProjects = populatedInvited;
          }
        },
        error: () => {
          // Si no existe en Mongo, intentamos registrarlo y luego cargamos
          if (user) {
            this.userService.registerUser(user).subscribe({
              next: (r: any) => {
                this.mongoUserId = r?.user?._id || '';
                console.log('mongoUserId tras registro:', this.mongoUserId);
                if (this.mongoUserId) this.loadProjects(this.mongoUserId);
              },
              error: (e) => console.error('No se pudo registrar usuario en Mongo', e)
            });
          }
        }
      });
    }
  }

  createProject() {
    this.showCreateModal = true;
  }

  onSearchChange() {
    // Actualización en tiempo real se maneja vía getter filteredProjects
    this.searchHint = '';
  }

  selectTab(tab: 'projects' | 'invitations') {
    this.activeTab = tab;
    this.searchQuery = '';
  }

  closeModal() {
    this.showCreateModal = false;
  }

  confirmCreate() {
    // Placeholder: aquí podríamos llamar a un servicio
    if (!this.mongoUserId) { this.closeModal(); return; }
    const payload: ProjectDto = { userId: this.mongoUserId, name: this.projectName, sector: this.projectSector };
    this.projectService.createProject(payload).subscribe({
      next: (p) => {
        this.projects = [p, ...this.projects];
        this.closeModal();
        this.projectName = '';
        this.projectSector = '';
      },
      error: (e) => {
        console.error('Error creando proyecto', e);
        this.closeModal();
      }
    });
  }

  private loadProjects(userMongoId: string) {
    this.loadingProjects = true;
    this.loadError = '';
    this.projectService.getProjectsByUser(userMongoId).subscribe({
      next: (list) => {
        console.log('Proyectos recibidos:', list);
        this.projects = list || [];
        this.loadingProjects = false;
      },
      error: (e) => {
        console.error('Error cargando proyectos', e);
        this.loadError = 'No se pudieron cargar los proyectos.';
        this.loadingProjects = false;
      }
    });
  }

  private loadInvitations(email: string) {
    this.loadingInvitations = true;
    this.invitationsService.getInvitationsByUser(email).subscribe({
      next: (list) => {
        console.log('Invitaciones recibidas:', list);
        this.invitations = list || [];
        this.loadingInvitations = false;
      },
      error: (e) => {
        console.error('Error cargando invitaciones', e);
        this.loadingInvitations = false;
      }
    });
  }

  acceptInvitation(invitation: InvitationDto) {
    if (!invitation._id || !this.currentUserEmail) return;
    
    this.invitationsService.acceptInvitation(invitation._id, this.currentUserEmail).subscribe({
      next: () => {
        console.log('Invitación aceptada');
        // Recargar invitaciones
        this.loadInvitations(this.currentUserEmail);
        // Recargar proyectos
        if (this.mongoUserId) {
          this.loadProjects(this.mongoUserId);
        }
        // Recargar proyectos invitados
        this.userService.getUserByEmail(this.currentUserEmail).subscribe({
          next: (resp: any) => {
            const populatedInvited = resp?.user?.proyectosInvitados;
            if (Array.isArray(populatedInvited)) {
              this.invitedProjects = populatedInvited;
            }
          },
          error: () => {}
        });
      },
      error: (e) => {
        console.error('Error aceptando invitación', e);
        alert('Error al aceptar la invitación');
      }
    });
  }

  rejectInvitation(invitation: InvitationDto) {
    if (!invitation._id || !this.currentUserEmail) return;
    
    if (!confirm('¿Seguro que quieres rechazar esta invitación?')) return;
    
    this.invitationsService.rejectInvitation(invitation._id, this.currentUserEmail).subscribe({
      next: () => {
        console.log('Invitación rechazada');
        // Recargar invitaciones
        this.loadInvitations(this.currentUserEmail);
      },
      error: (e) => {
        console.error('Error rechazando invitación', e);
        alert('Error al rechazar la invitación');
      }
    });
  }

  leaveProject(project: ProjectDto, event: Event) {
    event.stopPropagation(); // Evitar que se abra el proyecto
    this.openDropdownId = null; // Cerrar el dropdown
    const projectId = (project as any)._id;
    if (!projectId || !this.currentUserEmail) return;
    
    if (!confirm(`¿Seguro que quieres salir del proyecto "${project.name}"?`)) return;
    
    this.invitationsService.leaveProject(projectId, this.currentUserEmail).subscribe({
      next: () => {
        console.log('Proyecto abandonado');
        // Recargar datos del usuario
        this.userService.getUserByEmail(this.currentUserEmail).subscribe({
          next: (resp: any) => {
            const populatedInvited = resp?.user?.proyectosInvitados;
            if (Array.isArray(populatedInvited)) {
              this.invitedProjects = populatedInvited;
            }
          },
          error: () => {}
        });
      },
      error: (e) => {
        console.error('Error abandonando proyecto', e);
        alert('Error al salir del proyecto');
      }
    });
  }

  // Header user actions
  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }
  onImageError() {
    this.imageError = true;
  }
  logout() {
    this.auth.logout();
  }
  goToProfile() {
    this.showUserDropdown = false;
    this.showProfile = true;
  }
  closeProfile() { this.showProfile = false; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const withinHeader = target.closest('.user-header');
    const withinDropdown = target.closest('.user-dropdown');
    const withinOptionsDropdown = target.closest('.options-dropdown');
    const withinMoreOptionsBtn = target.closest('.more-options-btn');
    
    if (!withinHeader && !withinDropdown) {
      this.showUserDropdown = false;
    }
    
    if (!withinOptionsDropdown && !withinMoreOptionsBtn) {
      this.openDropdownId = null;
    }
  }

  openProject(p: ProjectDto) {
    if (!p || !(p as any)._id) return;
    this.projectCtx.setProject(p);
    const projectId = (p as any)._id;
    const allowedTabs = (p as any).allowedTabs as string[] | undefined;
    const validTabsOrder = [
      'roadmap','statistics','map','inventory','customers','tasks','events','meetings','credentials','technology','documents','invoices','financials','budgets','marketing','rnd','legal','team','settings'
    ];
    let targetTab = 'inventory';
    if (Array.isArray(allowedTabs) && allowedTabs.length > 0) {
      const firstAllowed = allowedTabs.find(t => validTabsOrder.includes(t));
      if (firstAllowed) targetTab = firstAllowed;
    }
    this.router.navigate(['/p', projectId, targetTab]);
  }

  get filteredProjects(): ProjectDto[] {
    if (!this.projects || !this.projects.length) return [];
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.projects;
    return this.projects.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.sector || '').toLowerCase().includes(q)
    );
  }

  get filteredInvitedProjects(): ProjectDto[] {
    if (!this.invitedProjects || !this.invitedProjects.length) return [];
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.invitedProjects;
    return this.invitedProjects.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.sector || '').toLowerCase().includes(q)
    );
  }

  getProjectId(project: ProjectDto): string {
    return (project as any)._id || '';
  }

  isInvitedProject(projectId: string): boolean {
    return this.invitedProjects.some(p => (p as any)._id === projectId);
  }

  toggleDropdown(project: ProjectDto, event: Event) {
    event.stopPropagation();
    const projectId = this.getProjectId(project);
    this.openDropdownId = this.openDropdownId === projectId ? null : projectId;
  }

  get filteredInvitations(): InvitationDto[] {
    if (!this.invitations || !this.invitations.length) return [];
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.invitations;
    return this.invitations.filter(i => 
      i.inviterEmail.toLowerCase().includes(q) || 
      (i.projectId_data && i.projectId_data.name && i.projectId_data.name.toLowerCase().includes(q))
    );
  }
}