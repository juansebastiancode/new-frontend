import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CredentialDto {
  _id?: string;
  projectId: string;
  name: string;
  email: string;
  password?: string; // Solo para crear/actualizar, no se devuelve en list/get
  technology?: string;
  url?: string;
  notes?: string;
  fechaCreacion?: string;
}

@Injectable({ providedIn: 'root' })
export class CredentialsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  create(credential: Partial<CredentialDto> & { projectId: string; name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/credentials`, credential);
  }

  list(projectId: string): Observable<CredentialDto[]> {
    return this.http.get<CredentialDto[]>(`${this.apiUrl}/credentials?projectId=${projectId}`);
  }

  get(id: string): Observable<CredentialDto> {
    return this.http.get<CredentialDto>(`${this.apiUrl}/credentials/${id}`);
  }

  update(id: string, credential: Partial<CredentialDto>): Observable<CredentialDto> {
    return this.http.put<CredentialDto>(`${this.apiUrl}/credentials/${id}`, credential);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/credentials/${id}`);
  }

  getPassword(id: string): Observable<{ password: string; encrypted: boolean }> {
    return this.http.get<{ password: string; encrypted: boolean }>(`${this.apiUrl}/credentials/${id}/password`);
  }
}

