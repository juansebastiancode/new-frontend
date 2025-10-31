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
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryOrdersService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  create(order: InventoryOrderDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory-orders`, order);
  }

  list(projectId: string): Observable<InventoryOrderDto[]> {
    return this.http.get<InventoryOrderDto[]>(`${this.apiUrl}/inventory-orders?projectId=${projectId}`);
  }

  update(id: string, update: Partial<InventoryOrderDto>): Observable<InventoryOrderDto> {
    return this.http.put<InventoryOrderDto>(`${this.apiUrl}/inventory-orders/${id}`, update);
  }
}


