import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ProjectService, ProjectDto } from '../services/project.service';
import { ProjectContextService } from '../services/project-context.service';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  searchHint: string = '';
  showCreateModal: boolean = false;
  projectName: string = '';
  projectSector: string = '';
  projects: ProjectDto[] = [];
  mongoUserId: string = '';
  loadingProjects: boolean = false;
  loadError: string = '';
  // Usuario (header)
  userName: string = 'Usuario';
  userInitial: string = 'U';
  imageError: boolean = false;
  showUserDropdown: boolean = false;

  constructor(public auth: AuthService, private projectService: ProjectService, private userService: UserService, private router: Router, private projectCtx: ProjectContextService) {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.userName = user.displayName || user.email?.split('@')[0] || 'Usuario';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
    if (user?.email) {
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
    if (!withinHeader && !withinDropdown) {
      this.showUserDropdown = false;
    }
  }

  openProject(p: ProjectDto) {
    if (!p || !(p as any)._id) return;
    this.projectCtx.setProject(p);
    this.router.navigate(['/p', (p as any)._id, 'inventory']);
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
}