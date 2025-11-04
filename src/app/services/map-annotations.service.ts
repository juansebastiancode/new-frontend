import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MapAnnotationDto {
  _id?: string;
  projectId: string;
  lat: number;
  lng: number;
  text: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MapAnnotationsService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  list(projectId: string): Observable<MapAnnotationDto[]> {
    return this.http.get<MapAnnotationDto[]>(`${this.apiUrl}/projects/${projectId}/annotations`);
  }

  create(projectId: string, payload: Omit<MapAnnotationDto, 'projectId' | '_id' | 'createdAt'>): Observable<MapAnnotationDto> {
    return this.http.post<MapAnnotationDto>(`${this.apiUrl}/projects/${projectId}/annotations`, { ...payload, projectId });
  }

  delete(projectId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}/annotations/${id}`);
  }
}


