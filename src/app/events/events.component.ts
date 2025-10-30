import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="events-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="events-container">
          <h2>Eventos</h2>
          <div class="tabs">
            <button class="tab-button" [class.active]="activeTab==='upcoming'" (click)="activeTab='upcoming'">Próximos</button>
            <button class="tab-button" [class.active]="activeTab==='past'" (click)="activeTab='past'">Finalizados</button>
          </div>

          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar eventos..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addEvent()">
              <i class="fas fa-plus"></i>
              Nuevo evento
            </button>
          </div>

          <div *ngIf="filteredEvents.length > 0" class="events-grid">
            <div class="event-card" *ngFor="let event of filteredEvents">
              <div class="event-header">
                <div class="event-icon"><i class="far fa-calendar"></i></div>
                <div class="event-info">
                  <h3>{{ event.title }}</h3>
                  <p class="event-date">{{ formatDate(event.date) }}</p>
                </div>
              </div>
              <div class="event-details">
                <span class="detail-label">Ubicación: </span>
                <span class="detail-value">{{ event.location }}</span>
              </div>
              <div class="event-details">
                <span class="detail-label">Participantes: </span>
                <span class="detail-value">{{ event.participants }}</span>
              </div>
              <div class="event-actions">
                <button class="edit-btn" (click)="editEvent(event)"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" (click)="deleteEvent(event)"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredEvents.length===0" class="empty-state">
            <i class="far fa-calendar-xmark empty-icon"></i>
            <h3>No hay eventos en esta sección</h3>
            <button class="add-first-btn" (click)="addEvent()">
              <i class="fas fa-plus"></i>
              Agregar evento
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .events-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .events-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    .tabs { display: flex; margin-bottom: 18px; gap: 10px; }
    .tab-button { 
      padding: 8px 14px;
      border: none;
      background: #f4f4f4;
      cursor: pointer;
      font-size: 14px;
      border-radius: 6px;
      transition: background 0.23s;
      margin-bottom: 0;
    }
    .tab-button.active { background: #111; color: #fff; }
    .actions-bar { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 18px; }
    .search-wrap { position: relative; flex-grow: 1; max-width: 400px; }
    .search-input { width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #888; }
    .add-button { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 15px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; }
    .add-button:hover { opacity: 0.9; }
    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-top: 10px; }
    .event-card { background: white; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 18px; transition: box-shadow 0.13s, transform 0.13s; }
    .event-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .event-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .event-icon { width: 42px; height: 42px; border-radius: 6px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
    .event-icon i { font-size: 21px; color: #6b7280; }
    .event-info h3 { margin: 0 0 2px 0; font-size: 16px; font-weight: 600; color: #222; }
    .event-date { color: #6b7280; font-size: 14px; margin: 0; }
    .event-details { color: #444; font-size: 14px; margin-bottom: 1px; }
    .detail-label { font-weight: 500; color: #888; }
    .event-actions { margin-top: 10px; display: flex; gap: 8px; }
    .edit-btn, .delete-btn { background: #f3f4f6; border: none; border-radius: 7px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
    .edit-btn:hover { background: #e7e9eb; }
    .delete-btn { color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .empty-state { text-align: center; padding: 62px 18px; color: #6b7280; }
    .empty-icon { font-size: 40px; color: #d1d5db; margin-bottom: 16px; }
    .empty-state h3 { margin: 0 0 10px 0; font-size: 17px; color: #6b7280; }
    .add-first-btn { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-first-btn:hover { opacity: 0.9; }
    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions-bar { flex-direction: column; align-items: stretch; } .add-button { width: 100%; } .events-grid { grid-template-columns: 1fr; } }
  `]
})
export class EventsComponent {
  showProfile = false;
  activeTab: 'upcoming'|'past' = 'upcoming';
  searchQuery = '';
  events = [
    { id: 1, title: 'Demo Day', date: new Date('2024-10-29'), location: 'Auditorio Principal', participants: '90+', isPast:false },
    { id: 2, title: 'Fiesta de Verano', date: new Date('2023-08-15'), location: 'Terraza HQ', participants: '15', isPast:true },
    { id: 3, title: 'Lanzamiento Producto', date: new Date('2024-12-01'), location: 'Online', participants: 'todo el equipo', isPast:false }
  ];
  get filteredEvents() {
    let filtered = this.events.filter(ev => this.activeTab==='upcoming' ? !ev.isPast : ev.isPast);
    if (!this.searchQuery) return filtered;
    return filtered.filter(ev => ev.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }
  formatDate(d: Date) { return d.toLocaleDateString('es-ES',{ year:'numeric', month:'short', day:'numeric' }); }
  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
  addEvent() { alert('Añadir evento'); }
  editEvent(event: any) { alert('Editar '+event.title); }
  deleteEvent(event: any) { alert('Eliminar '+event.title); }
}


