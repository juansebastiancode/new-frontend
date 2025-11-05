import { Component, OnInit, OnDestroy, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { ProjectContextService } from '../services/project-context.service';
import { UserService } from '../services/user.service';
import { InvitationsService } from '../services/invitations.service';

@Component({
  selector: 'app-menubar',
  imports: [CommonModule],
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss'
})
export class MenubarComponent implements OnInit, OnDestroy {
  @Output() profileClick = new EventEmitter<void>();
  
  user: User | null = null;
  userName: string = 'Usuario';
  userInitial: string = 'U';
  imageError: boolean = false;
  showUserDropdown: boolean = false;
  showMobileMenu: boolean = false;
  isMobile: boolean = false;
  appTitle: string = 'Plan B2B';
  enabledTabs: Set<string> | null = null;
  isProjectOwner: boolean = false;
  userAllowedTabs: Set<string> | null = null;
  currentProjectId: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private projectCtx: ProjectContextService,
    private userService: UserService,
    private invitationsService: InvitationsService
  ) {}

  ngOnInit() {
    // Detectar si estamos en móvil
    this.isMobile = window.innerWidth <= 768;
    
    // En desktop, el menú siempre está visible
    // En móvil, se oculta por defecto
    this.showMobileMenu = !this.isMobile;

    // Listener para cambios de tamaño de ventana
    window.addEventListener('resize', this.onResize.bind(this));

    this.authService.user$.subscribe(user => {
      this.user = user;
      this.imageError = false; // Reset error when user changes
      if (user) {
        this.userName = user.displayName || user.email?.split('@')[0] || 'Usuario';
        this.userInitial = this.userName.charAt(0).toUpperCase();
      }
    });

    // Cargar título y tabs habilitados desde el contexto de proyecto
    this.projectCtx.currentProject$.subscribe(proj => {
      const projId = (proj as any)?._id || null;
      
      // Si se limpia el proyecto (logout), resetear todo
      if (!proj) {
        this.currentProjectId = null;
        this.isProjectOwner = false;
        this.userAllowedTabs = null;
        this.appTitle = 'Plan B2B';
        this.enabledTabs = null;
        return;
      }
      
      // Solo verificar si cambió el proyecto
      if (projId !== this.currentProjectId) {
        this.currentProjectId = projId;
        this.isProjectOwner = false; // Reset al cambiar proyecto
        this.userAllowedTabs = null; // Reset permisos
        
        // Verificar si el usuario es propietario del proyecto
        if (proj && this.user?.email) {
          this.checkProjectOwner(proj);
        }
      }
      
      this.appTitle = proj?.name || 'Plan B2B';
      const tabs = (proj as any)?.enabledTabs as string[] | undefined;
      this.enabledTabs = tabs && tabs.length ? new Set(tabs) : null;
    });
  }
  
  checkProjectOwner(project: any) {
    if (!this.user?.email || !project?._id) return;
    
    // Si ya sabemos que es propietario, no hacer nada
    if (this.isProjectOwner) return;
    
    // Verificar localmente comparando el userId del proyecto con el mongoUserId del usuario
    const mongoUserId = this.authService.getMongoUserId();
    if (mongoUserId && project.userId) {
      this.isProjectOwner = project.userId === mongoUserId;
      
      if (!this.isProjectOwner) {
        // Si no es propietario, usar allowedTabs del proyecto si están disponibles (para no parpadear)
        if (project.allowedTabs && Array.isArray(project.allowedTabs)) {
          this.userAllowedTabs = new Set(project.allowedTabs);
        }
        // Siempre refrescar desde backend para captar cambios recientes de permisos
        this.loadUserPermissionsAndCache(project);
      } else {
        this.userAllowedTabs = null;
      }
      return;
    }
    
    // Fallback: si no tenemos mongoUserId localmente, hacer la llamada HTTP
    this.userService.getUserByEmail(this.user.email).subscribe({
      next: (resp: any) => {
        const user = resp?.user;
        if (!user) {
          this.isProjectOwner = true; // Si no hay datos, asumir owner por compatibilidad
          this.userAllowedTabs = null;
          return;
        }
        
        // Verificar si el projectId está en proyectosInvitados
        const invitedProjects = user.proyectosInvitados || [];
        const invitedProject = invitedProjects.find((p: any) => String(p._id || p) === String(project._id));
        const isInvited = !!invitedProject;
        
        // Si está en proyectosInvitados, NO es owner
        this.isProjectOwner = !isInvited;
        
        // Si es invitado, usar allowedTabs del proyecto si están disponibles
        if (isInvited) {
          if (invitedProject && invitedProject.allowedTabs && Array.isArray(invitedProject.allowedTabs)) {
            // Usar cache inmediato
            this.userAllowedTabs = new Set(invitedProject.allowedTabs);
            this.updateProjectCache(project._id, invitedProject.allowedTabs);
          } else {
            this.userAllowedTabs = null;
          }
          // Y refrescar permisos desde backend para captar cambios recientes
          this.loadUserPermissionsAndCache(project);
        } else {
          this.userAllowedTabs = null;
        }
      },
      error: () => {
        // En caso de error, asumir owner
        this.isProjectOwner = true;
        this.userAllowedTabs = null;
      }
    });
  }

  loadUserPermissionsAndCache(project: any) {
    if (!this.user?.email || !project?._id) return;
    
    this.invitationsService.getProjectMembers(project._id).subscribe({
      next: (members) => {
        const currentMember = members.find((m: any) => m.email === this.user?.email);
        if (currentMember && currentMember.allowedTabs) {
          this.userAllowedTabs = new Set(currentMember.allowedTabs);
          // Actualizar el cache del proyecto con los allowedTabs
          this.updateProjectCache(project._id, currentMember.allowedTabs);
        } else {
          this.userAllowedTabs = null;
        }
      },
      error: () => {
        this.userAllowedTabs = null;
      }
    });
  }

  updateProjectCache(projectId: string, allowedTabs: string[]) {
    const currentProject = this.projectCtx.getCurrent();
    if (currentProject && currentProject._id === projectId) {
      const updatedProject = { ...currentProject, allowedTabs };
      this.projectCtx.setProject(updatedProject);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.showMobileMenu = !this.isMobile;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const userInfo = target.closest('.user-info');
    const userDropdown = target.closest('.user-dropdown');
    
    // Si el clic no es en el user-info ni en el dropdown, cerrar el dropdown
    if (!userInfo && !userDropdown) {
      this.showUserDropdown = false;
    }
  }

  onImageError(event: any) {
    console.log('Error cargando imagen de perfil, usando inicial');
    this.imageError = true;
  }

  goToEvents() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'events']);
    else this.router.navigate(['/events']);
  }

  goToProfile() {
    this.showUserDropdown = false;
    this.profileClick.emit();
  }

  goToDashboard() {
    this.showUserDropdown = false;
    this.router.navigate(['/dashboard']);
  }

  goToCredentials() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'credentials']);
    else this.router.navigate(['/credentials']);
  }

  goToMeetings() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'meetings']);
    else this.router.navigate(['/meetings']);
  }

  goToDocuments() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'documents']);
    else this.router.navigate(['/documents']);
  }

  goToTechnology() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'technology']);
    else this.router.navigate(['/technology']);
  }

  goToAssistant() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'assistant']);
    else this.router.navigate(['/assistant']);
  }

  goToRnd() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'rnd']);
    else this.router.navigate(['/rnd']);
  }

  goToAccounts() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'financials']);
    else this.router.navigate(['/financials']);
  }

  goToBudgets() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'budgets']);
    else this.router.navigate(['/budgets']);
  }

  goToLegal() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'legal']);
    else this.router.navigate(['/legal']);
  }

  goToStats() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'statistics']);
    else this.router.navigate(['/statistics']);
  }

  goToWallet() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'invoices']);
    else this.router.navigate(['/invoices']);
  }

  goToSettings() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'settings']);
    else this.router.navigate(['/settings']);
  }

  goToInventory() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'inventory']);
    else this.router.navigate(['/inventory']);
  }


  goToCustomers() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'customers']);
    else this.router.navigate(['/customers']);
  }

  goToOrders() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'orders']);
    else this.router.navigate(['/orders']);
  }

  goToMarketing() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'marketing']);
    else this.router.navigate(['/marketing']);
  }


  goToInvoices() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'invoices']);
    else this.router.navigate(['/invoices']);
  }

  goToRoadmap() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'roadmap']);
    else this.router.navigate(['/roadmap']);
  }

  goToTasks() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'tasks']);
    else this.router.navigate(['/tasks']);
  }

  goToMap() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'map']);
    else this.router.navigate(['/map']);
  }

  logout() {
    this.showUserDropdown = false;
    this.authService.logout();
  }

  exitProject() {
    this.showUserDropdown = false;
    this.projectCtx.clear();
    this.router.navigate(['/dashboard']);
  }

  // Visibilidad y estado activo
  isEnabled(tabKey: string): boolean {
    if (tabKey === 'settings') return this.isProjectOwner;
    // Si es propietario, usa la configuración de enabledTabs
    if (this.isProjectOwner) {
      if (!this.enabledTabs) return true;
      return this.enabledTabs.has(tabKey);
    }
    // Si es invitado, verificar permisos específicos
    if (!this.userAllowedTabs) return false; // Si no hay permisos configurados, no mostrar nada
    return this.userAllowedTabs.has(tabKey);
  }

  isActive(tabKey: string): boolean {
    const url = this.router.url;
    const segment = this.keyToSegment(tabKey);
    return url.endsWith('/' + segment) || url.includes('/' + segment + '/');
  }

  private keyToSegment(tabKey: string): string {
    switch (tabKey) {
      case 'settings': return 'settings';
      case 'roadmap': return 'roadmap';
      case 'tasks': return 'tasks';
      case 'map': return 'map';
      case 'events': return 'events';
      case 'inventory': return 'inventory';
      case 'customers': return 'customers';
      case 'marketing': return 'marketing';
      case 'invoices': return 'invoices';
      case 'credentials': return 'credentials';
      case 'documents': return 'documents';
      case 'technology': return 'technology';
      case 'assistant': return 'assistant';
      case 'rnd': return 'rnd';
      case 'financials': return 'financials';
      case 'budgets': return 'budgets';
      case 'legal': return 'legal';
      default: return tabKey;
    }
  }
}
