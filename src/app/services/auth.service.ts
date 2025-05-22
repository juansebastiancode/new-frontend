import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Configurar persistencia local
    setPersistence(this.auth, browserLocalPersistence);

    // Recuperar el estado de autenticación del localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }

    // Escuchar cambios en la autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
      if (user) {
        // Guardar el usuario en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        // Actualizar el token
        user.getIdToken().then(token => {
          localStorage.setItem('token', token);
        });
      } else {
        // Limpiar localStorage al cerrar sesión
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    });
  }

  async signup(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.router.navigate(['/profile']);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.router.navigate(['/profile']);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): User | null {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : this.auth.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  async signupWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;
      this.router.navigate(['/profile']);
      return user;
    } catch (error) {
      throw error;
    }
  }
} 