import { Component, OnInit } from '@angular/core';
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
export class MenubarComponent implements OnInit {
  user: User | null = null;
  userName: string = 'Usuario';
  userInitial: string = 'U';
  imageError: boolean = false;
  showUserDropdown: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.imageError = false; // Reset error when user changes
      if (user) {
        this.userName = user.displayName || user.email?.split('@')[0] || 'Usuario';
        this.userInitial = this.userName.charAt(0).toUpperCase();
      }
    });
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
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
    this.router.navigate(['/profile']);
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
