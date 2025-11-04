import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CustomerDto {
  _id?: string;
  projectId: string;
  nombre: string;
  email?: string;
  telefono?: string;
  ubicacion?: string;
  ciudad?: string;
  pais?: string;
  notas?: string;
  esCliente: boolean;
  activo: boolean;
  eliminado: boolean;
  fechaCreacion?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createCustomer(customer: Partial<CustomerDto>): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers`, customer);
  }

  getCustomers(projectId?: string, esCliente?: boolean): Observable<CustomerDto[]> {
    let url = `${this.apiUrl}/customers`;
    const params: string[] = [];
    
    if (projectId) params.push(`projectId=${projectId}`);
    if (esCliente !== undefined) params.push(`esCliente=${esCliente}`);
    
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get<CustomerDto[]>(url);
  }

  updateCustomer(id: string, customer: Partial<CustomerDto>): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${id}`);
  }
}

