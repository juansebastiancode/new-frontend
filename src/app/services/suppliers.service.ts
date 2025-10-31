import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupplierDto {
  _id?: string;
  projectId: string;
  nombre: string;
  email?: string;
  telefono?: string;
  ubicacion?: string;
  ciudad?: string;
  pais?: string;
  notas?: string;
  activo: boolean;
  eliminado: boolean;
  fechaCreacion?: Date;
}

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  createSupplier(supplier: Partial<SupplierDto>): Observable<any> {
    return this.http.post(`${this.apiUrl}/suppliers`, supplier);
  }

  getSuppliers(projectId?: string): Observable<SupplierDto[]> {
    let url = `${this.apiUrl}/suppliers`;
    const params: string[] = [];
    if (projectId) params.push(`projectId=${projectId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<SupplierDto[]>(url);
  }

  updateSupplier(id: string, supplier: Partial<SupplierDto>): Observable<any> {
    return this.http.put(`${this.apiUrl}/suppliers/${id}`, supplier);
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/suppliers/${id}`);
  }
}


