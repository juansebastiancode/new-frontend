import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent, FormsModule],
  template: `
    <div class="documents-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="documents-container">
          <h2>Documentos</h2>
          <p>Gestiona tus documentos y archivos del proyecto.</p>
          
          <div class="actions-bar">
            <div class="search-wrap">
              <input type="text" placeholder="Buscar documentos..." [(ngModel)]="searchQuery" class="search-input">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="add-button" (click)="addDocument()">
              <i class="fas fa-plus"></i>
              Nuevo documento
            </button>
          </div>

          <div class="documents-grid">
            <div class="document-card" *ngFor="let document of filteredDocuments">
              <div class="document-header">
                <div class="document-icon">
                  <i [class]="getFileTypeIcon(document.type)"></i>
                </div>
                <div class="document-info">
                  <h3>{{ document.name }}</h3>
                  <p class="document-date">{{ document.date }}</p>
                </div>
                <div class="document-actions">
                  <button class="action-btn edit-btn" (click)="editDocument(document)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" (click)="deleteDocument(document)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="document-details">
                <div class="detail-item">
                  <span class="detail-label">Tipo:</span>
                  <span class="detail-value">{{ document.type }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Tamaño:</span>
                  <span class="detail-value">{{ document.size }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Descripción:</span>
                  <span class="detail-value">{{ document.description || 'Sin descripción' }}</span>
                </div>
              </div>
              <div class="document-footer">
                <button class="view-btn" (click)="viewDocument(document)">
                  <i class="fas fa-eye"></i>
                  Ver documento
                </button>
                <button class="download-btn" (click)="downloadDocument(document)">
                  <i class="fas fa-download"></i>
                  Descargar
                </button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredDocuments.length === 0">
            <i class="fas fa-file empty-icon"></i>
            <h3>No hay documentos registrados</h3>
            <p>Comienza agregando tu primer documento.</p>
            <button class="add-first-btn" (click)="addDocument()">
              <i class="fas fa-plus"></i>
              Agregar primer documento
            </button>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .documents-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .documents-container { padding: 24px; }
    h2 { margin: 0 0 8px 0; font-weight: 600; font-size: 24px; }
    p { color: #555; margin-bottom: 24px; }
    .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
    .search-wrap { position: relative; flex-grow: 1; max-width: 400px; }
    .search-input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; }
    .search-input:focus { border-color: #111; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; }
    .add-button { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-button:hover { opacity: 0.9; }
    .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .document-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .document-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .document-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .document-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .document-icon i { font-size: 20px; color: #6b7280; }
    .document-info { flex-grow: 1; }
    .document-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .document-date { margin: 0; color: #6b7280; font-size: 14px; }
    .document-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .document-details { margin-bottom: 16px; }
    .detail-item { display: flex; margin-bottom: 8px; }
    .detail-label { font-weight: 500; color: #6b7280; min-width: 80px; font-size: 14px; }
    .detail-value { color: #111; font-size: 14px; word-break: break-all; }
    .document-footer { border-top: 1px solid #e5e7eb; padding-top: 16px; display: flex; gap: 8px; }
    .view-btn, .download-btn { flex: 1; background: none; border: 1px solid #ddd; color: #666; cursor: pointer; font-size: 14px; padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease; }
    .view-btn:hover { background: #f9fafb; border-color: #111; color: #111; }
    .download-btn:hover { background: #f9fafb; border-color: #111; color: #111; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0 0 24px 0; color: #9ca3af; }
    .add-first-btn { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-first-btn:hover { opacity: 0.9; }
    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions-bar { flex-direction: column; align-items: stretch; } .search-wrap { max-width: none; } .documents-grid { grid-template-columns: 1fr; } }
  `]
})
export class DocumentsComponent {
  showProfile: boolean = false;
  searchQuery: string = '';
  documents = [
    {
      id: 1,
      name: 'Manual de Usuario.pdf',
      date: '15 Mar 2024',
      type: 'PDF',
      size: '2.4 MB',
      description: 'Manual completo del sistema'
    },
    {
      id: 2,
      name: 'Contrato Servicio.docx',
      date: '10 Mar 2024',
      type: 'Word',
      size: '156 KB',
      description: 'Contrato de servicio anual'
    },
    {
      id: 3,
      name: 'Presentacion.pdf',
      date: '5 Mar 2024',
      type: 'PDF',
      size: '3.1 MB',
      description: 'Presentación del proyecto'
    }
  ];

  get filteredDocuments() {
    if (!this.searchQuery) return this.documents;
    return this.documents.filter(doc => 
      doc.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getFileTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'PDF': 'fas fa-file-pdf',
      'Word': 'fas fa-file-word',
      'Excel': 'fas fa-file-excel',
      'PowerPoint': 'fas fa-file-powerpoint',
      'Image': 'fas fa-file-image',
      'Video': 'fas fa-file-video',
      'Audio': 'fas fa-file-audio',
      'Code': 'fas fa-file-code',
      'Other': 'fas fa-file'
    };
    return icons[type] || icons['Other'];
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
  addDocument() { alert('Agregar nuevo documento'); }
  editDocument(document: any) { alert(`Editar documento: ${document.name}`); }
  deleteDocument(document: any) { if (confirm(`¿Eliminar documento ${document.name}?`)) { alert(`Eliminar documento: ${document.name}`); } }
  viewDocument(document: any) { alert(`Ver documento: ${document.name}`); }
  downloadDocument(document: any) { alert(`Descargar documento: ${document.name}`); }
}


