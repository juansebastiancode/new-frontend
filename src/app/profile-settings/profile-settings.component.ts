import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile-settings',
  imports: [],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss'
})
export class ProfileSettingsComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigate(page: string): void {
    const path = `/${page}`;
    this.router.navigate([path]);
  }

  goBack() {
    console.log("back")
    this.navigate('/profile');
  }

  async logout() {
    try {
      // Cerrar sesión en Firebase y limpiar localStorage
      await this.authService.logout();
      
      // Forzar el cierre en todas las pestañas
      window.localStorage.clear();
      
      // Revocar tokens y cookies
      if (navigator.credentials) {
        await navigator.credentials.preventSilentAccess();
      }
      
      // Redirigir a la página principal
      this.router.navigate(['/']);
      
      // Opcional: Recargar la página para asegurar un estado limpio
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
