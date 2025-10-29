import { Component, OnInit, OnDestroy, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { ProjectContextService } from '../services/project-context.service';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private projectCtx: ProjectContextService
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

    this.projectCtx.currentProject$.subscribe(proj => {
      this.appTitle = proj?.name || 'Plan B2B';
      const tabs = (proj as any)?.enabledTabs as string[] | undefined;
      if (tabs && tabs.length) {
        this.enabledTabs = new Set(tabs);
      } else {
        // fallback desde localStorage cuando no hay proyecto activo o el proyecto no define tabs
        try {
          const raw = localStorage.getItem('enabledTabsDefault');
          const arr = raw ? (JSON.parse(raw) as string[]) : undefined;
          this.enabledTabs = arr && arr.length ? new Set(arr) : null;
        } catch {
          this.enabledTabs = null;
        }
      }
    });
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

  // Navegación
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

  goToSuppliers() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'suppliers']);
    else this.router.navigate(['/suppliers']);
  }

  goToCustomers() {
    const proj = this.projectCtx.getCurrent();
    if (proj?._id) this.router.navigate(['/p', proj._id, 'customers']);
    else this.router.navigate(['/customers']);
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

  isEnabled(tabKey: string): boolean {
    // Ajustes siempre visible
    if (tabKey === 'settings') return true;
    // Si no hay configuración, mostrar todo
    if (!this.enabledTabs) return true;
    return this.enabledTabs.has(tabKey);
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
      case 'suppliers': return 'suppliers';
      case 'customers': return 'customers';
      case 'invoices': return 'invoices';
      case 'statistics': return 'statistics';
      default: return tabKey;
    }
  }
}
