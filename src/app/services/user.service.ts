import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Registrar usuario en MongoDB después de autenticación con Firebase
  registerUser(user: User): Observable<any> {
    const userData = {
      nombre: user.displayName || user.email?.split('@')[0] || 'Usuario',
      email: user.email,
      instagram: '',
      telefono: '',
      pais: '',
      ciudad: ''
    };

    return this.http.post(`${this.apiUrl}/users`, userData);
  }

  // Obtener usuario por email
  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${email}`);
  }

  // Actualizar perfil de usuario
  updateUser(email: string, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${email}`, updateData);
  }

  // Obtener todos los usuarios
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }
}
