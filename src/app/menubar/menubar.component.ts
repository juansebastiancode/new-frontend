import { Component, OnInit, OnDestroy, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

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

  constructor(
    private router: Router,
    private authService: AuthService
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
    this.router.navigate(['/events']);
  }

  goToProfile() {
    this.showUserDropdown = false;
    this.profileClick.emit();
  }

  goToStats() {
    // Por ahora no hay página de estadísticas
    console.log('Ir a estadísticas');
  }

  goToWallet() {
    // Por ahora no hay página de dinero
    console.log('Ir a dinero');
  }

  goToSettings() {
    this.router.navigate(['/profile-settings']);
  }

  logout() {
    this.showUserDropdown = false;
    this.authService.logout();
  }
}
