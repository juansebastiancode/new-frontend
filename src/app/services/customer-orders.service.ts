import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CustomerOrderDto {
  _id?: string;
  projectId: string;
  customerId?: string;
  customerNombre: string;
  productos: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  cantidad: number;
  entrega?: string; // YYYY-MM-DD
  notas?: string;
  estado?: 'pendiente' | 'enviado' | 'completado' | 'cancelado';
  facturaPdf?: string; // Nombre del archivo PDF de la factura
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerOrdersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  create(order: CustomerOrderDto, invoiceFile?: File): Observable<any> {
    const formData = new FormData();
    Object.keys(order).forEach(key => {
      const value = (order as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    if (invoiceFile) {
      formData.append('facturaPdf', invoiceFile);
    }
    return this.http.post(`${this.apiUrl}/customer-orders`, formData);
  }

  list(projectId: string): Observable<CustomerOrderDto[]> {
    return this.http.get<CustomerOrderDto[]>(`${this.apiUrl}/customer-orders?projectId=${projectId}`);
  }

  update(id: string, update: Partial<CustomerOrderDto>, invoiceFile?: File): Observable<CustomerOrderDto> {
    const formData = new FormData();
    Object.keys(update).forEach(key => {
      const value = (update as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    if (invoiceFile) {
      formData.append('facturaPdf', invoiceFile);
    }
    return this.http.put<CustomerOrderDto>(`${this.apiUrl}/customer-orders/${id}`, formData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customer-orders/${id}`);
  }

  getInvoiceUrl(orderId: string): string {
    return `${this.apiUrl}/customer-orders/${orderId}/invoice`;
  }

  deleteInvoice(orderId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customer-orders/${orderId}/invoice`);
  }
}

