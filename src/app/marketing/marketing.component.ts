import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="marketing-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="marketing-container">
          <h2>Marketing</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'campaigns'" (click)="select('campaigns')">Campañas</button>
            <button class="tab" [class.active]="selected === 'analytics'" (click)="select('analytics')">Analíticas</button>
            <button class="tab" [class.active]="selected === 'content'" (click)="select('content')">Contenido</button>
          </div>

          <div class="section" *ngIf="selected === 'campaigns'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar campañas..." [(ngModel)]="searchCampaigns" />
              </div>
              <button class="primary" (click)="addCampaign()">Nueva campaña</button>
            </div>
            <p class="muted">Gestiona tus campañas de marketing.</p>
            <div class="card">Aún no tienes campañas creadas.</div>
          </div>

          <div class="section" *ngIf="selected === 'analytics'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar métricas..." [(ngModel)]="searchAnalytics" />
              </div>
              <button class="primary" (click)="generateReport()">Generar reporte</button>
            </div>
            <p class="muted">Analiza el rendimiento de tus campañas.</p>
            <div class="card">No hay datos de analíticas disponibles.</div>
          </div>

          <div class="section" *ngIf="selected === 'content'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar contenido..." [(ngModel)]="searchContent" />
              </div>
              <button class="primary" (click)="addContent()">Crear contenido</button>
            </div>
            <p class="muted">Crea y gestiona contenido para tus campañas.</p>
            <div class="card">Aún no tienes contenido creado.</div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .marketing-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .marketing-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; }
    .muted { color: #555; font-size: 13px; margin: 0 0 8px 0; }

    .tabs { display: flex; gap: 8px; margin: 8px 0 24px 0; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
    .tab.active { background: #111; color: #fff; border-color: #111; }

    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 12px 0; }
    .search { min-width: 240px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; outline: none; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; background: #fff; }
    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class MarketingComponent {
  showProfile: boolean = false;
  selected: 'campaigns' | 'analytics' | 'content' = 'campaigns';
  searchCampaigns: string = '';
  searchAnalytics: string = '';
  searchContent: string = '';

  select(section: 'campaigns' | 'analytics' | 'content') { this.selected = section; }

  addCampaign() { alert('Nueva campaña'); }
  generateReport() { alert('Generar reporte'); }
  addContent() { alert('Crear contenido'); }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}
