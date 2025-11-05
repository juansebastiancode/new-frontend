import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-rnd',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="rnd-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="rnd-container">
          <h2>I+D</h2>
          <p>Gestiona tus proyectos de investigación y desarrollo.</p>
          
          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar proyectos..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addProject()">
              <i class="fas fa-plus"></i>
              Nuevo proyecto
            </button>
          </div>

          <div class="rnd-grid">
            <div class="rnd-card" *ngFor="let project of filteredProjects">
              <div class="rnd-header">
                <div class="rnd-icon">
                  <i class="fas fa-flask"></i>
                </div>
                <div class="rnd-info">
                  <h3>{{ project.name }}</h3>
                  <p class="rnd-status">{{ project.status }}</p>
                </div>
                <div class="rnd-actions">
                  <button class="action-btn edit-btn" (click)="editProject(project)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteProject(project)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="rnd-details">
                <div class="detail-item">
                  <span class="detail-label">Área:</span>
                  <span class="detail-value">{{ project.area }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Inicio:</span>
                  <span class="detail-value">{{ project.startDate }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Descripción:</span>
                  <span class="detail-value">{{ project.description || 'Sin descripción' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredProjects.length === 0">
            <i class="fas fa-flask empty-icon"></i>
            <h3>No hay proyectos de I+D</h3>
            <p>Comienza agregando tu primer proyecto de investigación.</p>
            <button class="add-first-btn" (click)="addProject()">
              <i class="fas fa-plus"></i>
              Agregar primer proyecto
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .rnd-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .rnd-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    p { color: #555; margin-bottom: 24px; }
    .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
    .search-wrap { position: relative; flex-grow: 1; max-width: 400px; }
    .search-input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; }
    .search-input:focus { border-color: #111; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; }
    .add-button { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-button:hover { opacity: 0.9; }
    .rnd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .rnd-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .rnd-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .rnd-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .rnd-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .rnd-icon i { font-size: 20px; color: #6b7280; }
    .rnd-info { flex-grow: 1; }
    .rnd-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .rnd-status { margin: 0; color: #6b7280; font-size: 14px; }
    .rnd-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .rnd-details { margin-bottom: 16px; }
    .detail-item { display: flex; margin-bottom: 8px; }
    .detail-label { font-weight: 500; color: #6b7280; min-width: 80px; font-size: 14px; }
    .detail-value { color: #111; font-size: 14px; word-break: break-all; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0 0 24px 0; color: #9ca3af; }
    .add-first-btn { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-first-btn:hover { opacity: 0.9; }
    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions-bar { flex-direction: column; align-items: stretch; } .search-wrap { max-width: none; } .rnd-grid { grid-template-columns: 1fr; } }
  `]
})
export class RndComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  projects = [
    { id: 1, name: 'IA Conversacional', status: 'En desarrollo', area: 'Inteligencia Artificial', startDate: 'Ene 2024', description: 'Desarrollo de chatbots inteligentes' },
    { id: 2, name: 'Blockchain privado', status: 'Investigación', area: 'Blockchain', startDate: 'Mar 2024', description: 'Exploración de soluciones blockchain' },
    { id: 3, name: 'IoT para Smart Cities', status: 'Planificación', area: 'Internet de las Cosas', startDate: 'May 2024', description: 'Sensores urbanos inteligentes' }
  ];

  get filteredProjects() {
    if (!this.searchQuery) return this.projects;
    return this.projects.filter(project => 
      project.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      project.area.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
  addProject() { alert('Agregar nuevo proyecto I+D'); }
  editProject(project: any) { alert(`Editar proyecto: ${project.name}`); }
  deleteProject(project: any) { if (confirm(`¿Eliminar proyecto ${project.name}?`)) { alert(`Eliminar proyecto: ${project.name}`); } }
}


