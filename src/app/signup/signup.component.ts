import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
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
      this.errorMessage = error.message;
    }
  }
}
