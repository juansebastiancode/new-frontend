import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryOrderDto {
  _id?: string;
  projectId: string;
  itemId?: string;
  itemNombre: string;
  proveedor: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  cantidad: number;
  llegada?: string; // YYYY-MM-DD
  notas?: string;
  estado?: 'pendiente' | 'completado' | 'cancelado';
  facturaPdf?: string; // Nombre del archivo PDF de la factura
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryOrdersService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  create(order: InventoryOrderDto, invoiceFile?: File): Observable<any> {
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
    return this.http.post(`${this.apiUrl}/inventory-orders`, formData);
  }

  list(projectId: string): Observable<InventoryOrderDto[]> {
    return this.http.get<InventoryOrderDto[]>(`${this.apiUrl}/inventory-orders?projectId=${projectId}`);
  }

  update(id: string, update: Partial<InventoryOrderDto>, invoiceFile?: File): Observable<InventoryOrderDto> {
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
    return this.http.put<InventoryOrderDto>(`${this.apiUrl}/inventory-orders/${id}`, formData);
  }

  getInvoiceUrl(orderId: string): string {
    return `${this.apiUrl}/inventory-orders/${orderId}/invoice`;
  }

  deleteInvoice(orderId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventory-orders/${orderId}/invoice`);
  }
}


