import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvitationDto {
  _id?: string;
  projectId: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
  respondedAt?: string;
  projectId_data?: any; // Datos del proyecto si se hace populate
}

@Injectable({
  providedIn: 'root'
})
export class InvitationsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createInvitation(invitation: Partial<InvitationDto>): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitations`, invitation);
  }

  getInvitationsByProject(projectId: string): Observable<InvitationDto[]> {
    return this.http.get<InvitationDto[]>(`${this.apiUrl}/invitations/by-project?projectId=${projectId}`);
  }

  getInvitationsByUser(email: string): Observable<InvitationDto[]> {
    return this.http.get<InvitationDto[]>(`${this.apiUrl}/invitations/by-user?email=${email}`);
  }

  acceptInvitation(id: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitations/${id}/accept`, { email });
  }

  rejectInvitation(id: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitations/${id}/reject`, { email });
  }

  getProjectMembers(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invitations/members?projectId=${projectId}`);
  }

  leaveProject(projectId: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitations/leave-project`, { projectId, email });
  }

  updateMemberPermissions(projectId: string, inviteeEmail: string, allowedTabs: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/invitations/permissions`, { projectId, inviteeEmail, allowedTabs });
  }

  removeMember(projectId: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitations/remove-member`, { projectId, email });
  }
}

