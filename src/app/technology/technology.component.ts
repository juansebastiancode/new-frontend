import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-technology',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="technology-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="technology-container">
          <h2>Tecnología</h2>
          <p>Gestiona las tecnologías y herramientas utilizadas en tu proyecto.</p>
          
          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar tecnologías..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addTechnology()">
              <i class="fas fa-plus"></i>
              Nueva tecnología
            </button>
          </div>

          <div class="technology-grid">
            <div class="technology-card" *ngFor="let tech of filteredTechnologies">
              <div class="technology-header">
                <div class="technology-icon">
                  <i [class]="getCategoryIcon(tech.category)"></i>
                </div>
                <div class="technology-info">
                  <h3>{{ tech.name }}</h3>
                  <p class="technology-category">{{ tech.category }}</p>
                </div>
                <div class="technology-actions">
                  <button class="action-btn edit-btn" (click)="editTechnology(tech)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteTechnology(tech)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="technology-details">
                <div class="detail-item">
                  <span class="detail-label">Versión:</span>
                  <span class="detail-value">{{ tech.version || 'No especificada' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Propósito:</span>
                  <span class="detail-value">{{ tech.purpose || 'Sin definir' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredTechnologies.length === 0">
            <i class="fas fa-code empty-icon"></i>
            <h3>No hay tecnologías registradas</h3>
            <p>Comienza agregando tu primera tecnología.</p>
            <button class="add-first-btn" (click)="addTechnology()">
              <i class="fas fa-plus"></i>
              Agregar primera tecnología
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .technology-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .technology-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    p { color: #555; margin-bottom: 24px; }
    .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
    .search-wrap { position: relative; flex-grow: 1; max-width: 400px; }
    .search-input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; }
    .search-input:focus { border-color: #111; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; }
    .add-button { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-button:hover { opacity: 0.9; }
    .technology-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .technology-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .technology-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .technology-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .technology-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .technology-icon i { font-size: 20px; color: #6b7280; }
    .technology-info { flex-grow: 1; }
    .technology-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .technology-category { margin: 0; color: #6b7280; font-size: 14px; }
    .technology-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .technology-details { margin-bottom: 16px; }
    .detail-item { display: flex; margin-bottom: 8px; }
    .detail-label { font-weight: 500; color: #6b7280; min-width: 80px; font-size: 14px; }
    .detail-value { color: #111; font-size: 14px; word-break: break-all; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0 0 24px 0; color: #9ca3af; }
    .add-first-btn { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-first-btn:hover { opacity: 0.9; }
    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions-bar { flex-direction: column; align-items: stretch; } .search-wrap { max-width: none; } .technology-grid { grid-template-columns: 1fr; } }
  `]
})
export class TechnologyComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  technologies = [
    { id: 1, name: 'React', category: 'Framework', version: '18.2.0', purpose: 'Frontend' },
    { id: 2, name: 'Node.js', category: 'Runtime', version: '20.0.0', purpose: 'Backend' },
    { id: 3, name: 'MongoDB', category: 'Database', version: '7.0.0', purpose: 'Almacenamiento' }
  ];

  get filteredTechnologies() {
    if (!this.searchQuery) return this.technologies;
    return this.technologies.filter(tech => 
      tech.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      tech.category.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Framework': 'fab fa-react',
      'Library': 'fas fa-book',
      'Database': 'fas fa-database',
      'Runtime': 'fab fa-node-js',
      'Language': 'fas fa-code',
      'Tool': 'fas fa-wrench',
      'Service': 'fas fa-cloud',
      'Other': 'fas fa-cog'
    };
    return icons[category] || icons['Other'];
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
  addTechnology() { alert('Agregar nueva tecnología'); }
  editTechnology(tech: any) { alert(`Editar tecnología: ${tech.name}`); }
  deleteTechnology(tech: any) { if (confirm(`¿Eliminar tecnología ${tech.name}?`)) { alert(`Eliminar tecnología: ${tech.name}`); } }
}

