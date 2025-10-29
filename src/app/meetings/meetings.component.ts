import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="meetings-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="meetings-container">
          <h2>Reuniones</h2>
          <p>Gestiona tus reuniones y eventos importantes.</p>
          
          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar reuniones..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addMeeting()">
              <i class="fas fa-plus"></i>
              Nueva reunión
            </button>
          </div>

          <div class="meetings-grid">
            <div class="meeting-card" *ngFor="let meeting of filteredMeetings">
              <div class="meeting-header">
                <div class="meeting-icon">
                  <i class="fas fa-video"></i>
                </div>
                <div class="meeting-info">
                  <h3>{{ meeting.title }}</h3>
                  <p class="meeting-date">{{ formatDate(meeting.date) }}</p>
                </div>
                <div class="meeting-actions">
                  <button class="action-btn edit-btn" (click)="editMeeting(meeting)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteMeeting(meeting)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="meeting-details">
                <div class="detail-item">
                  <span class="detail-label">Hora:</span>
                  <span class="detail-value">{{ meeting.time }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Duración:</span>
                  <span class="detail-value">{{ meeting.duration }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Tipo:</span>
                  <span class="detail-value">{{ meeting.type }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Participantes:</span>
                  <span class="detail-value">{{ meeting.participants }}</span>
                </div>
                <div class="detail-item" *ngIf="meeting.location">
                  <span class="detail-label">Ubicación:</span>
                  <span class="detail-value">{{ meeting.location }}</span>
                </div>
                <div class="detail-item" *ngIf="meeting.link">
                  <span class="detail-label">Enlace:</span>
                  <a [href]="meeting.link" target="_blank" class="meeting-link">{{ meeting.link }}</a>
                </div>
              </div>
              <div class="meeting-notes" *ngIf="meeting.notes">
                <p><strong>Notas:</strong> {{ meeting.notes }}</p>
              </div>
              <div class="meeting-status">
                <span class="status-badge" [class]="getStatusClass(meeting.status)">
                  {{ getStatusText(meeting.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredMeetings.length === 0">
            <i class="fas fa-calendar-alt empty-icon"></i>
            <h3>No hay reuniones programadas</h3>
            <p>Comienza agregando tu primera reunión para organizar tu agenda.</p>
            <button class="add-first-btn" (click)="addMeeting()">
              <i class="fas fa-plus"></i>
              Agregar primera reunión
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .meetings-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .meetings-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    p { color: #555; margin-bottom: 24px; }
    
    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }
    .search-wrap {
      position: relative;
      flex-grow: 1;
      max-width: 400px;
    }
    .search-input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .search-input:focus {
      border-color: #111;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #888;
    }
    .add-button {
      background-color: #111;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 20px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s ease;
    }
    .add-button:hover {
      opacity: 0.9;
    }

    .meetings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .meeting-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .meeting-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .meeting-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .meeting-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .meeting-icon i {
      font-size: 20px;
      color: #6b7280;
    }
    .meeting-info {
      flex-grow: 1;
    }
    .meeting-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111;
    }
    .meeting-date {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }
    .meeting-actions {
      display: flex;
      gap: 8px;
    }
    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
    }
    .edit-btn {
      background: #f3f4f6;
      color: #6b7280;
    }
    .edit-btn:hover {
      background: #e5e7eb;
    }
    .delete-btn {
      background: #fef2f2;
      color: #ef4444;
    }
    .delete-btn:hover {
      background: #fee2e2;
    }

    .meeting-details {
      margin-bottom: 16px;
    }
    .detail-item {
      display: flex;
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: 500;
      color: #6b7280;
      min-width: 100px;
      font-size: 14px;
    }
    .detail-value {
      color: #111;
      font-size: 14px;
    }
    .meeting-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 14px;
      word-break: break-all;
    }
    .meeting-link:hover {
      text-decoration: underline;
    }

    .meeting-notes {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .meeting-notes p {
      margin: 0;
      font-size: 14px;
      color: #111;
    }

    .meeting-status {
      display: flex;
      justify-content: flex-end;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-scheduled {
      background: #dbeafe;
      color: #2563eb;
    }
    .status-in-progress {
      background: #fef3c7;
      color: #d97706;
    }
    .status-completed {
      background: #d1fae5;
      color: #059669;
    }
    .status-cancelled {
      background: #fee2e2;
      color: #dc2626;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6b7280;
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #d1d5db;
    }
    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #6b7280;
    }
    .empty-state p {
      margin: 0 0 24px 0;
      color: #9ca3af;
    }
    .add-first-btn {
      background-color: #111;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s ease;
    }
    .add-first-btn:hover {
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
      .actions-bar { flex-direction: column; align-items: stretch; }
      .search-wrap { max-width: none; }
      .meetings-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MeetingsComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  
  meetings = [
    {
      id: 1,
      title: 'Reunión de equipo semanal',
      date: new Date('2024-01-15'),
      time: '10:00 AM',
      duration: '1 hora',
      type: 'Presencial',
      participants: '5 personas',
      location: 'Sala de conferencias A',
      link: '',
      notes: 'Revisar progreso del proyecto y planificar próximas tareas',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Presentación al cliente',
      date: new Date('2024-01-16'),
      time: '2:00 PM',
      duration: '45 minutos',
      type: 'Virtual',
      participants: '8 personas',
      location: '',
      link: 'https://meet.google.com/abc-defg-hij',
      notes: 'Mostrar avances del producto y recopilar feedback',
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Sprint Planning',
      date: new Date('2024-01-12'),
      time: '9:00 AM',
      duration: '2 horas',
      type: 'Híbrida',
      participants: '6 personas',
      location: 'Oficina + Virtual',
      link: 'https://zoom.us/j/123456789',
      notes: 'Planificar tareas para el próximo sprint',
      status: 'completed'
    }
  ];

  get filteredMeetings() {
    if (!this.searchQuery) return this.meetings;
    return this.meetings.filter(meeting => 
      meeting.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      meeting.type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      meeting.notes.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Programada',
      'in-progress': 'En curso',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }

  addMeeting() {
    alert('Agregar nueva reunión');
  }

  editMeeting(meeting: any) {
    alert(`Editar reunión: ${meeting.title}`);
  }

  deleteMeeting(meeting: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar la reunión ${meeting.title}?`)) {
      alert(`Eliminar reunión: ${meeting.title}`);
    }
  }
}
