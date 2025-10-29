import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { ProjectContextService } from '../services/project-context.service';
import { MapAnnotationsService, MapAnnotationDto } from '../services/map-annotations.service';

declare const L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="map-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="overlay-card">
          <div class="title">Visualiza tus datos</div>
          <select class="mini-select">
            <option value="clientes">Clientes</option>
            <option value="proveedores">Proveedores</option>
            <option value="eventos">Eventos</option>
          </select>
          <button class="primary small" (click)="startAddLabel()">Nueva etiqueta</button>
          <span class="error" *ngIf="errorMsg">{{ errorMsg }}</span>
        </div>
        <div id="map" class="leaflet-map"></div>
        <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
      </div>
    </div>
  `,
  styles: [`
    .map-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { position: relative; margin-left: 250px; height: 100vh; background: white; padding: 0; }
    .leaflet-map { width: 100%; height: 100vh; }
    /* Ocultar controles y attribution */
    .leaflet-control-zoom, .leaflet-control-attribution { display: none !important; }
    .overlay-card { position: absolute; top: 16px; left: 16px; background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #111; box-shadow: 0 6px 18px rgba(0,0,0,0.08); z-index: 1002; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; width: 320px; max-width: calc(100% - 40px); }
    .title { font-weight: 600; }
    .mini-select { border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px; font-size: 13px; background: #fff; width: 100%; }
    .primary.small { background: #111; color: #fff; border: none; border-radius: 8px; padding: 8px 10px; cursor: pointer; font-size: 13px; }
    .error { color: #c00; font-size: 12px; }

    /* Popup bonito */
    :host ::ng-deep .leaflet-popup-content-wrapper { border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #ececec; }
    :host ::ng-deep .leaflet-popup-tip { color: #fff; }
    :host ::ng-deep .label-card { width: 280px; max-width: 80vw; display: flex; flex-direction: column; gap: 10px; }
    :host ::ng-deep .label-header { display: flex; justify-content: space-between; align-items: center; }
    :host ::ng-deep .label-title { font-size: 18px; font-weight: 700; color: #111; }
    :host ::ng-deep .label-text { font-size: 14px; color: #333; line-height: 1.4; }
    :host ::ng-deep .btn-row { display: flex; gap: 8px; justify-content: flex-end; }
    :host ::ng-deep .btn { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 10px; font-size: 13px; cursor: pointer; }
    :host ::ng-deep .btn.delete { border-color: #f1c0c0; color: #b00020; }
    :host ::ng-deep .btn:hover { background: #f7f7f7; }

    @media (max-width: 768px) { .main-content { margin-left: 200px; } .leaflet-map { height: 100vh; } }
  `]
})
export class MapComponent implements AfterViewInit {
  showProfile = false;
  private map: any;
  private adding = false;
  private markersById = new Map<string, any>();
  errorMsg = '';

  constructor(private projectCtx: ProjectContextService, private api: MapAnnotationsService) {}

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }

  ngAfterViewInit(): void {
    if (!(window as any).L) {
      console.error('Leaflet no está cargado. Verifica el CDN en index.html');
      return;
    }
    // Mapa centrado en España, reactivando interacciones comunes
    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      doubleClickZoom: false
    }).setView([40.0, -4.0], 6);

    // Basemap con labels (menos simplificado)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Cargar anotaciones del proyecto actual si existe
    const proj = this.projectCtx.getCurrent();
    const projectId = (proj as any)?._id;
    if (projectId) {
      this.api.list(projectId).subscribe({
        next: (items) => items.forEach(a => this.renderAnnotation(a)),
        error: () => { this.errorMsg = 'No se pudieron cargar anotaciones'; }
      });
    }

    // Click para añadir etiqueta cuando está activo el modo
    this.map.on('click', (e: any) => {
      if (!this.adding) return;
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const text = prompt('Texto de la etiqueta:') || '';
      const projId = (this.projectCtx.getCurrent() as any)?._id;
      if (!projId) { this.errorMsg = 'Abre un proyecto para guardar'; return; }
      this.api.create(projId, { lat, lng, text }).subscribe({
        next: (item) => {
          this.renderAnnotation(item);
          this.adding = false;
        },
        error: () => { this.errorMsg = 'No se pudo guardar la etiqueta'; this.adding = false; }
      });
    });

    // Doble clic siempre crea etiqueta
    this.map.on('dblclick', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const text = prompt('Texto de la etiqueta:') || '';
      const projId = (this.projectCtx.getCurrent() as any)?._id;
      if (!projId) { this.errorMsg = 'Abre un proyecto para guardar'; return; }
      this.api.create(projId, { lat, lng, text }).subscribe({
        next: (item) => this.renderAnnotation(item),
        error: () => { this.errorMsg = 'No se pudo guardar la etiqueta'; }
      });
    });
  }

  startAddLabel() {
    this.errorMsg = '';
    this.adding = true;
    alert('Haz clic en el mapa para colocar la etiqueta');
  }

  private renderAnnotation(a: MapAnnotationDto) {
    if (!this.map) return;
    const outer = L.circleMarker([a.lat, a.lng], {
      radius: 16,
      color: '#111',
      weight: 2,
      opacity: 1,
      fillColor: '#111',
      fillOpacity: 1
    });

    const inner = L.circleMarker([a.lat, a.lng], {
      radius: 10,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillColor: '#fff',
      fillOpacity: 1
    });

    const group = L.featureGroup([outer, inner]).addTo(this.map);
    this.markersById.set(String(a._id || `${a.lat},${a.lng}`), group);

    const safeText = (a.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const idAttr = a._id ? `data-id=\"${a._id}\"` : '';
    group.bindPopup(`<div class=\"label-card\">` +
      `<div class=\"label-header\">` +
        `<div class=\"label-title\">Etiqueta</div>` +
      `</div>` +
      `<div class=\"label-text\">${safeText || 'Sin descripción'}</div>` +
      `<div class=\"btn-row\">` +
        `<button class=\"btn delete\" ${idAttr}>Eliminar</button>` +
      `</div>` +
    `</div>`);

    group.on('popupopen', (e: any) => {
      const el = e.popup.getElement() as HTMLElement;
      const btn = el.querySelector('button.delete-btn, .btn.delete') as HTMLButtonElement | null;
      if (!btn) return;
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const projId = (this.projectCtx.getCurrent() as any)?._id;
        if (!projId) { this.errorMsg = 'Abre un proyecto para eliminar'; return; }
        if (!id) { group.remove(); return; }
        this.api.delete(projId, id).subscribe({
          next: () => {
            group.remove();
            this.markersById.delete(id);
          },
          error: () => { this.errorMsg = 'No se pudo eliminar la etiqueta'; }
        });
      };
    });
  }
}


