import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  @Output() closeProfile = new EventEmitter<void>();
  
  user: any = null;
  imageError: boolean = false;
  private clickListener: (event: Event) => void = () => {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnInit() {
    // Agregar el listener después de que el componente esté completamente inicializado
    setTimeout(() => {
      this.clickListener = (event: Event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-card')) {
          this.closeProfile.emit();
        }
      };
      document.addEventListener('click', this.clickListener);
    }, 200);
  }

  ngOnDestroy() {
    // Remover el listener cuando se destruye el componente
    document.removeEventListener('click', this.clickListener);
  }

  onImageError(event: any) {
    this.imageError = true;
  }

  getUserName(): string {
    return this.user?.displayName || this.user?.email || 'Usuario';
  }

  getUserInitial(): string {
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
  }
}
