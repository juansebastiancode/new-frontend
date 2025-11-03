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
} from '@angular/fire/auth';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { ProjectContextService } from './project-context.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private mongoUserIdSubject = new BehaviorSubject<string | null>(null);
  mongoUserId$ = this.mongoUserIdSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private userService: UserService,
    private projectCtx: ProjectContextService
  ) {
    // Configurar persistencia local
    setPersistence(this.auth, browserLocalPersistence);

    // Recuperar el estado de autenticación del localStorage
    const savedUser = localStorage.getItem('user');
    const savedMongoUserId = localStorage.getItem('mongoUserId');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
    if (savedMongoUserId) {
      this.mongoUserIdSubject.next(savedMongoUserId);
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
        
        // Cargar el MongoDB ID del usuario
        this.loadMongoUserId(user);
      } else {
        // Limpiar localStorage al cerrar sesión
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('mongoUserId');
        this.mongoUserIdSubject.next(null);
        // Limpiar también el proyecto actual
        this.projectCtx.clear();
      }
    });
  }

  async signup(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.router.navigate(['/dashboard']);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.router.navigate(['/dashboard']);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      // Limpiar manualmente por si acaso onAuthStateChanged no se dispara rápido
      this.projectCtx.clear();
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
      this.router.navigate(['/dashboard']);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Método privado para cargar el MongoDB ID del usuario
  private loadMongoUserId(user: User) {
    if (!user.email) return;
    
    // Primero intentar obtener el usuario existente
    this.userService.getUserByEmail(user.email).subscribe({
      next: (response) => {
        console.log('✅ Usuario encontrado en MongoDB:', response);
        if (response?.user?._id) {
          this.mongoUserIdSubject.next(response.user._id);
          localStorage.setItem('mongoUserId', response.user._id);
        }
      },
      error: (error) => {
        // Si no existe, registrarlo
        console.log('Usuario no encontrado, registrándolo...');
        this.userService.registerUser(user).subscribe({
          next: (response) => {
            console.log('✅ Usuario registrado en MongoDB:', response);
            if (response?.user?._id) {
              this.mongoUserIdSubject.next(response.user._id);
              localStorage.setItem('mongoUserId', response.user._id);
            }
          },
          error: (err) => {
            console.error('❌ Error al registrar usuario en MongoDB:', err);
          }
        });
      }
    });
  }

  getMongoUserId(): string | null {
    return this.mongoUserIdSubject.value;
  }
} 