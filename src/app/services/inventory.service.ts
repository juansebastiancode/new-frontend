import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventoryItemDto {
  _id?: string;
  projectId: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  cantidad: number;
  stockMinimo: number;
  unidad: string;
  precioUnitario: number;
  proveedor?: string;
  ubicacion?: string;
  codigo?: string;
  activo: boolean;
  eliminado: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createItem(item: Partial<InventoryItemDto>): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory`, item);
  }

  getItems(projectId?: string): Observable<InventoryItemDto[]> {
    let url = `${this.apiUrl}/inventory`;
    if (projectId) url += `?projectId=${projectId}`;
    return this.http.get<InventoryItemDto[]>(url);
  }

  updateItem(id: string, item: Partial<InventoryItemDto>): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventory/${id}`, item);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventory/${id}`);
  }
}

