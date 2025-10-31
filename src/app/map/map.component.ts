import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { ProjectContextService } from '../services/project-context.service';
import { MapAnnotationsService, MapAnnotationDto } from '../services/map-annotations.service';
import { CustomersService, CustomerDto } from '../services/customers.service';
import { SuppliersService, SupplierDto } from '../services/suppliers.service';

declare const L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="map-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="overlay-card">
          <div class="title">Visualiza tus datos</div>
          <select class="mini-select" [(ngModel)]="selectedDataset" (change)="onDatasetChange()">
            <option value="todos">Todos</option>
            <option value="clientes">Clientes</option>
            <option value="proveedores">Proveedores</option>
            <option value="etiquetas">Etiquetas</option>
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
    .map-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
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
    :host ::ng-deep .label-card { width: 280px; max-width: 80vw; display: flex; flex-direction: column; gap: 10px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    :host ::ng-deep .label-header { display: flex; justify-content: space-between; align-items: center; }
    :host ::ng-deep .label-title { font-size: 18px; font-weight: 700; color: #111; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    :host ::ng-deep .label-text { font-size: 14px; color: #333; line-height: 1.4; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    :host ::ng-deep .btn-row { display: flex; gap: 8px; justify-content: flex-end; }
    :host ::ng-deep .btn { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 10px; font-size: 13px; cursor: pointer; }
    :host ::ng-deep .btn.delete { border-color: #f1c0c0; color: #b00020; }
    :host ::ng-deep .btn:hover { background: #f7f7f7; }

    :host ::ng-deep .custom-flag-marker { background: transparent; border: none; }
    :host ::ng-deep .custom-flag-marker svg { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }

    @media (max-width: 768px) { .main-content { margin-left: 200px; } .leaflet-map { height: 100vh; } }
  `]
})
export class MapComponent implements AfterViewInit {
  showProfile = false;
  private map: any;
  private adding = false;
  private markersById = new Map<string, any>();
  private customersLayer: any | null = null;
  private suppliersLayer: any | null = null;
  private annotationsLayer: any | null = null;
  private geocodeCache = new Map<string, { lat: number; lng: number }>();
  private overlapCount = new Map<string, number>();
  errorMsg = '';
  selectedDataset: 'todos' | 'clientes' | 'proveedores' | 'etiquetas' = 'todos';

  constructor(private projectCtx: ProjectContextService, private api: MapAnnotationsService, private customersApi: CustomersService, private suppliersApi: SuppliersService) {}

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
    }).setView([40.0, -3.5], 5.5);

    // Basemap con labels (menos simplificado)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Capa para clientes
    this.customersLayer = L.layerGroup().addTo(this.map);
    // Capa para proveedores
    this.suppliersLayer = L.layerGroup().addTo(this.map);
    // Capa para etiquetas
    this.annotationsLayer = L.layerGroup().addTo(this.map);

    // Cargar anotaciones del proyecto actual si existe
    const proj = this.projectCtx.getCurrent();
    const projectId = (proj as any)?._id;
    if (projectId) {
      this.api.list(projectId).subscribe({
        next: (items) => items.forEach(a => this.renderAnnotation(a)),
        error: () => { this.errorMsg = 'No se pudieron cargar anotaciones'; }
      });
    }

    // Cargar clientes por defecto
    this.onDatasetChange();

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

  onDatasetChange() {
    if (!this.map) return;
    const showClientes = this.selectedDataset === 'clientes' || this.selectedDataset === 'todos';
    const showProveedores = this.selectedDataset === 'proveedores' || this.selectedDataset === 'todos';
    const showEtiquetas = this.selectedDataset === 'etiquetas' || this.selectedDataset === 'todos';
    this.setLayerVisibility(this.customersLayer, showClientes);
    this.setLayerVisibility(this.suppliersLayer, showProveedores);
    this.setLayerVisibility(this.annotationsLayer, showEtiquetas);
    if (showClientes) this.loadCustomersMarkers(); else this.clearCustomersMarkers();
    if (showProveedores) this.loadSuppliersMarkers(); else this.clearSuppliersMarkers();
  }

  private setLayerVisibility(layer: any, visible: boolean) {
    if (!layer) return;
    if (visible) {
      if (!this.map.hasLayer(layer)) {
        layer.addTo(this.map);
      }
    } else {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    }
  }

  private clearCustomersMarkers() {
    if (this.customersLayer) {
      this.customersLayer.clearLayers();
    }
  }

  private clearSuppliersMarkers() {
    if (this.suppliersLayer) {
      this.suppliersLayer.clearLayers();
    }
  }

  private loadCustomersMarkers() {
    const proj = this.projectCtx.getCurrent();
    const projectId = (proj as any)?._id;
    if (!projectId) { this.errorMsg = 'Abre un proyecto para ver clientes en el mapa'; return; }

    this.clearCustomersMarkers();
    this.customersApi.getCustomers(projectId).subscribe({
      next: async (customers) => {
        const points: Array<{ c: CustomerDto, lat: number, lng: number }> = [];
        for (const c of customers) {
          const candidate = ((c.ciudad || '').trim()) || ((c.ubicacion || '').trim()) || ((c.pais || '').trim());
          if (!candidate) continue;
          let coords = this.geocodeCity(candidate);
          if (!coords) {
            coords = await this.geocodeCityAsync(candidate);
          }
          if (!coords) continue;
          // Evitar solapamiento: pequeño desplazamiento si ya existe un marcador en esas coords
          const key = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
          const count = (this.overlapCount.get(key) || 0) + 1;
          this.overlapCount.set(key, count);
          const offset = this.computeOffset(coords.lat, coords.lng, count);
          points.push({ c, lat: offset.lat, lng: offset.lng });
        }

        if (points.length === 0) {
          this.errorMsg = 'No se pudo ubicar ningún cliente (revisa ciudad/ubicación).';
        } else {
          this.errorMsg = '';
        }
        points.forEach(p => this.renderCustomerMarker(p.c, p.lat, p.lng));
        // Mantener siempre la vista de España
        this.map.setView([40.0, -3.5], 5.5);
      },
      error: () => { this.errorMsg = 'No se pudieron cargar clientes'; }
    });
  }

  private loadSuppliersMarkers() {
    const proj = this.projectCtx.getCurrent();
    const projectId = (proj as any)?._id;
    if (!projectId) { this.errorMsg = 'Abre un proyecto para ver proveedores en el mapa'; return; }

    this.clearSuppliersMarkers();
    this.suppliersApi.getSuppliers(projectId).subscribe({
      next: async (suppliers) => {
        const points: Array<{ s: SupplierDto, lat: number, lng: number }> = [];
        for (const s of suppliers) {
          const candidate = ((s.ciudad || '').trim()) || ((s.ubicacion || '').trim()) || ((s.pais || '').trim());
          if (!candidate) continue;
          let coords = this.geocodeCity(candidate);
          if (!coords) {
            coords = await this.geocodeCityAsync(candidate);
          }
          if (!coords) continue;
          // Evitar solapamiento: pequeño desplazamiento si ya existe un marcador en esas coords
          const key = `supplier_${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
          const count = (this.overlapCount.get(key) || 0) + 1;
          this.overlapCount.set(key, count);
          const offset = this.computeOffset(coords.lat, coords.lng, count);
          points.push({ s, lat: offset.lat, lng: offset.lng });
        }

        if (points.length === 0 && this.selectedDataset === 'proveedores') {
          this.errorMsg = 'No se pudo ubicar ningún proveedor (revisa ciudad/ubicación).';
        } else if (this.selectedDataset === 'proveedores') {
          this.errorMsg = '';
        }
        points.forEach(p => this.renderSupplierMarker(p.s, p.lat, p.lng));
        // Mantener siempre la vista de España
        this.map.setView([40.0, -3.5], 5.5);
      },
      error: () => { this.errorMsg = 'No se pudieron cargar proveedores'; }
    });
  }

  private renderSupplierMarker(s: SupplierDto, lat: number, lng: number) {
    if (!this.map || !this.suppliersLayer) return;
    const color = '#f59e0b'; // Color naranja/ámbar para proveedores
    
    const flagIcon = L.divIcon({
      className: 'custom-flag-marker',
      html: `
        <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
          <!-- Poste -->
          <rect x="2" y="2" width="2" height="28" fill="${color}"/>
          <!-- Bandera -->
          <path d="M 4 2 L 22 2 L 22 14 L 4 2 Z" fill="${color}" stroke="${color}" stroke-width="1"/>
          <path d="M 4 2 L 4 14 L 22 14 Z" fill="${color}"/>
        </svg>
      `,
      iconSize: [24, 32],
      iconAnchor: [3, 30],
      popupAnchor: [0, -30]
    });
    
    const marker = L.marker([lat, lng], { icon: flagIcon }).addTo(this.suppliersLayer);
    const name = (s.nombre || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const email = (s.email || 'Sin email').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const ciudad = (s.ciudad || 'Sin ciudad').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    marker.bindPopup(`<div class="label-card">` +
      `<div class="label-header">` +
        `<div class="label-title">${name}</div>` +
      `</div>` +
      `<div class="label-text">${email}</div>` +
      `<div class="label-text">${ciudad}</div>` +
    `</div>`);
  }

  private renderCustomerMarker(c: CustomerDto, lat: number, lng: number) {
    if (!this.map || !this.customersLayer) return;
    const color = '#0ea5e9'; // Color azul para clientes
    
    const flagIcon = L.divIcon({
      className: 'custom-flag-marker',
      html: `
        <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
          <!-- Poste -->
          <rect x="2" y="2" width="2" height="28" fill="${color}"/>
          <!-- Bandera -->
          <path d="M 4 2 L 22 2 L 22 14 L 4 2 Z" fill="${color}" stroke="${color}" stroke-width="1"/>
          <path d="M 4 2 L 4 14 L 22 14 Z" fill="${color}"/>
        </svg>
      `,
      iconSize: [24, 32],
      iconAnchor: [3, 30],
      popupAnchor: [0, -30]
    });
    
    const marker = L.marker([lat, lng], { icon: flagIcon }).addTo(this.customersLayer);
    const name = (c.nombre || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const email = (c.email || 'Sin email').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const ciudad = (c.ciudad || 'Sin ciudad').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    marker.bindPopup(`<div class="label-card">` +
      `<div class="label-header">` +
        `<div class="label-title">${name}</div>` +
      `</div>` +
      `<div class="label-text">${email}</div>` +
      `<div class="label-text">${ciudad}</div>` +
    `</div>`);
  }

  private geocodeCity(cityRaw: string): { lat: number; lng: number } | null {
    const city = cityRaw.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const db: Record<string, { lat: number; lng: number }> = {
      'madrid': { lat: 40.4168, lng: -3.7038 },
      'barcelona': { lat: 41.3874, lng: 2.1686 },
      'valencia': { lat: 39.4699, lng: -0.3763 },
      'sevilla': { lat: 37.3891, lng: -5.9845 },
      'zaragoza': { lat: 41.6488, lng: -0.8891 },
      'malaga': { lat: 36.7213, lng: -4.4214 },
      'murcia': { lat: 37.9922, lng: -1.1307 },
      'palma': { lat: 39.5696, lng: 2.6502 },
      'palma de mallorca': { lat: 39.5696, lng: 2.6502 },
      'bilbao': { lat: 43.263, lng: -2.935 },
      'alicante': { lat: 38.3452, lng: -0.481 },
      'cordoba': { lat: 37.8882, lng: -4.7794 },
      'valladolid': { lat: 41.6523, lng: -4.7245 },
      'vigo': { lat: 42.2406, lng: -8.7207 },
      'gijon': { lat: 43.5357, lng: -5.6615 },
      'granada': { lat: 37.1773, lng: -3.5986 },
      'salamanca': { lat: 40.9701, lng: -5.66354 }
    };
    const local = db[city] || null;
    if (local) return local;
    const cached = this.geocodeCache.get(city);
    return cached || null;
  }

  private async geocodeCityAsync(cityRaw: string): Promise<{ lat: number; lng: number } | null> {
    const query = `${cityRaw}, España`;
    const key = cityRaw.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    if (this.geocodeCache.has(key)) return this.geocodeCache.get(key)!;
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
        headers: { 'Accept-Language': 'es' }
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const value = { lat, lng };
        this.geocodeCache.set(key, value);
        return value;
      }
      return null;
    } catch {
      return null;
    }
  }

  private computeOffset(lat: number, lng: number, index: number): { lat: number; lng: number } {
    // Primer marcador sin desplazamiento
    if (index <= 1) return { lat, lng };
    // Radio ~60m, ángulo según índice
    const meters = 60;
    const angle = (index - 1) * (Math.PI / 3); // 6 posiciones por vuelta
    const dLat = (meters * Math.sin(angle)) / 111320; // metros -> grados lat
    const dLng = (meters * Math.cos(angle)) / (111320 * Math.cos(lat * Math.PI / 180));
    return { lat: lat + dLat, lng: lng + dLng };
  }

  startAddLabel() {
    this.errorMsg = '';
    this.adding = true;
    alert('Haz clic en el mapa para colocar la etiqueta');
  }

  private renderAnnotation(a: MapAnnotationDto) {
    if (!this.map || !this.annotationsLayer) return;
    
    // Crear icono de bandera personalizado
    const flagIcon = L.divIcon({
      className: 'custom-flag-marker',
      html: `
        <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
          <!-- Poste -->
          <rect x="2" y="2" width="2" height="28" fill="#111"/>
          <!-- Bandera -->
          <path d="M 4 2 L 22 2 L 22 14 L 4 2 Z" fill="#111" stroke="#111" stroke-width="1"/>
          <path d="M 4 2 L 4 14 L 22 14 Z" fill="#000"/>
        </svg>
      `,
      iconSize: [24, 32],
      iconAnchor: [3, 30],
      popupAnchor: [0, -30]
    });

    const marker = L.marker([a.lat, a.lng], { icon: flagIcon }).addTo(this.annotationsLayer);
    this.markersById.set(String(a._id || `${a.lat},${a.lng}`), marker);

    const safeText = (a.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const idAttr = a._id ? `data-id=\"${a._id}\"` : '';
    marker.bindPopup(`<div class=\"label-card\">` +
      `<div class=\"label-header\">` +
        `<div class=\"label-title\">Etiqueta</div>` +
      `</div>` +
      `<div class=\"label-text\">${safeText || 'Sin descripción'}</div>` +
      `<div class=\"btn-row\">` +
        `<button class=\"btn delete\" ${idAttr}>Eliminar</button>` +
      `</div>` +
    `</div>`);

    marker.on('popupopen', (e: any) => {
      const el = e.popup.getElement() as HTMLElement;
      const btn = el.querySelector('button.delete-btn, .btn.delete') as HTMLButtonElement | null;
      if (!btn) return;
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const projId = (this.projectCtx.getCurrent() as any)?._id;
        if (!projId) { this.errorMsg = 'Abre un proyecto para eliminar'; return; }
        if (!id) { marker.remove(); return; }
        this.api.delete(projId, id).subscribe({
          next: () => {
            marker.remove();
            this.markersById.delete(id);
          },
          error: () => { this.errorMsg = 'No se pudo eliminar la etiqueta'; }
        });
      };
    });
  }
}


