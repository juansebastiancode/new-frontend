import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectDto {
  _id?: string;
  userId: string;
  name: string;
  sector: string;
  description?: string;
  type?: string;
  enabledTabs?: string[];
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  createProject(project: ProjectDto): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(`${this.apiUrl}/projects`, project);
  }

  getProjectsByUser(userId: string): Observable<ProjectDto[]> {
    return this.http.get<ProjectDto[]>(`${this.apiUrl}/projects/user/${userId}`);
  }

  getProjectById(projectId: string): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.apiUrl}/projects/${projectId}`);
  }

  updateProject(projectId: string, update: Partial<ProjectDto>): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/projects/${projectId}`, update);
  }

  deleteProject(projectId: string) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}`);
  }
}


