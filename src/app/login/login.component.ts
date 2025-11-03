import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    try {
      await this.authService.signup(this.email, this.password);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async signupWithGoogle() {
    try {
      await this.authService.signupWithGoogle();
    } catch (error: any) {
      // Silenciar cierre manual del popup de Google
      const code = error?.code || error?.error?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        this.errorMessage = '';
        return;
      }
      this.errorMessage = error?.message || 'Error durante la autenticación';
    }
  }
}
