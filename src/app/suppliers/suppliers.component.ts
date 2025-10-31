import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { SuppliersService, SupplierDto } from '../services/suppliers.service';
import { ProjectContextService } from '../services/project-context.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="suppliers-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="suppliers-container">
          <h2>Proveedores</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'suppliers'" (click)="select('suppliers')">Proveedores</button>
            <button class="tab" [class.active]="selected === 'contacts'" (click)="select('contacts')">Contactos</button>
            <button class="tab" [class.active]="selected === 'purchases'" (click)="select('purchases')">Compras</button>
          </div>

          <div class="section" *ngIf="selected === 'suppliers'">
            <div class="actions">
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input class="search" type="text" placeholder="Buscar proveedores..." [(ngModel)]="searchSuppliers" />
              </div>
              <button class="primary" (click)="openModal()">Añadir proveedor</button>
            </div>
            
            <div class="suppliers-grid">
              <div class="supplier-card" *ngFor="let s of filteredSuppliers">
                <div class="supplier-header">
                  <div class="supplier-icon"><i class="fas fa-truck"></i></div>
                  <div class="supplier-info">
                    <h3>{{ s.nombre }}</h3>
                    <p class="supplier-detail">{{ s.email || 'Sin email' }}</p>
                  </div>
                  <div class="supplier-actions">
                    <button class="action-btn edit-btn" (click)="editSupplier(s)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" (click)="deleteSupplier(s)"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
                <div class="supplier-details">
                  <div class="detail-item"><span class="detail-label">Teléfono:</span><span class="detail-value">{{ s.telefono || 'No especificado' }}</span></div>
                  <div class="detail-item"><span class="detail-label">Ubicación:</span><span class="detail-value">{{ s.ubicacion || 'No especificada' }}</span></div>
                  <div class="detail-item" *ngIf="s.ciudad || s.pais"><span class="detail-label">Ciudad:</span><span class="detail-value">{{ s.ciudad }}{{ s.pais ? ', ' + s.pais : '' }}</span></div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="filteredSuppliers.length === 0">
              <i class="far fa-address-book empty-icon"></i>
              <h3>No hay proveedores</h3>
              <p>Comienza agregando tu primer proveedor.</p>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'contacts'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar contactos..." [(ngModel)]="searchContacts" />
              </div>
              <button class="primary" (click)="addContact()">Añadir contacto</button>
            </div>
            
            <div class="card">No hay contactos registrados.</div>
          </div>

          <div class="section" *ngIf="selected === 'purchases'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar compras..." [(ngModel)]="searchPurchases" />
              </div>
              <button class="primary" (click)="addPurchase()">Nueva compra</button>
            </div>
            
            <div class="card">No hay compras registradas.</div>
          </div>

          <!-- Modal añadir/editar proveedor -->
          <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>{{ editing ? 'Editar proveedor' : 'Nuevo proveedor' }}</h3>
              <div class="modal-form">
                <div class="form-group"><label>Nombre *</label><input type="text" [(ngModel)]="form.nombre" /></div>
                <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="form.email" /></div>
                <div class="form-group"><label>Teléfono</label><input type="text" [(ngModel)]="form.telefono" /></div>
                <div class="form-group"><label>Dirección</label><input type="text" [(ngModel)]="form.ubicacion" /></div>
                <div class="form-row">
                  <div class="form-group"><label>Ciudad</label><input type="text" [(ngModel)]="form.ciudad" /></div>
                  <div class="form-group"><label>País</label><input type="text" [(ngModel)]="form.pais" /></div>
                </div>
                <div class="form-group"><label>Notas</label><textarea rows="3" [(ngModel)]="form.notas"></textarea></div>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeModal()">Cancelar</button>
                <button class="modal-btn primary-btn" [disabled]="!form.nombre || loading" (click)="saveSupplier()">{{ loading ? 'Guardando...' : 'Guardar' }}</button>
              </div>
              <span class="error" *ngIf="error">{{ error }}</span>
            </div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .suppliers-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .suppliers-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; }
    .muted { color: #555; font-size: 13px; margin: 0 0 8px 0; }

    .tabs { display: flex; gap: 8px; margin: 8px 0 24px 0; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
    .tab.active { background: #111; color: #fff; border-color: #111; }

    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 20px 0; }
    .search-wrap { position: relative; }
    .search { min-width: 420px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px 10px 36px; outline: none; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 14px; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .suppliers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .supplier-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform .2s, box-shadow .2s; }
    .supplier-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
    .supplier-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .supplier-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .supplier-icon i { font-size: 20px; color: #6b7280; }
    .supplier-info { flex-grow: 1; }
    .supplier-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .supplier-detail { margin: 0; color: #6b7280; font-size: 14px; }
    .supplier-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .supplier-details { margin-bottom: 16px; }
    .detail-item { display: flex; margin-bottom: 8px; }
    .detail-label { font-weight: 500; color: #6b7280; min-width: 80px; font-size: 14px; }
    .detail-value { color: #111; font-size: 14px; word-break: break-all; }
    .empty-state { text-align: center; padding: 140px 20px 80px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }

    .modal-backdrop { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .modal-content { background:#fff; border-radius:12px; padding:24px; width:90%; max-width:600px; max-height:90vh; overflow-y:auto; }
    .modal-form { margin-bottom:20px; }
    .form-group { margin-bottom:16px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .form-group label { display:block; margin-bottom:6px; font-size:14px; font-weight:500; color:#333; }
    .form-group input, .form-group textarea { width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; outline:none; }
    .modal-actions { display:flex; justify-content:flex-end; gap:12px; margin-top:24px; }
    .modal-btn { padding:10px 20px; border-radius:8px; cursor:pointer; font-size:14px; border:none; }
    .cancel-btn { background:#f3f4f6; color:#333; }
    .primary-btn { background:#111; color:#fff; }
    .error { color:#dc2626; font-size:14px; display:block; margin-top:8px; }
    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class SuppliersComponent implements OnInit {
  showProfile: boolean = false;
  selected: 'suppliers' | 'contacts' | 'purchases' = 'suppliers';
  searchSuppliers: string = '';
  searchContacts: string = '';
  searchPurchases: string = '';
  suppliers: SupplierDto[] = [];
  showModal: boolean = false;
  editing: SupplierDto | null = null;
  loading: boolean = false;
  error: string = '';
  form: any = { nombre: '', email: '', telefono: '', ubicacion: '', ciudad: '', pais: '', notas: '' };

  constructor(private suppliersApi: SuppliersService, private projectCtx: ProjectContextService) {}

  ngOnInit() { this.loadSuppliers(); }

  get projectId(): string | null { const p = this.projectCtx.getCurrent(); return (p as any)?._id || null; }

  get filteredSuppliers() {
    if (!this.searchSuppliers) return this.suppliers;
    return this.suppliers.filter(s =>
      s.nombre.toLowerCase().includes(this.searchSuppliers.toLowerCase()) ||
      s.email?.toLowerCase().includes(this.searchSuppliers.toLowerCase()) ||
      s.telefono?.includes(this.searchSuppliers)
    );
  }

  select(section: 'suppliers' | 'contacts' | 'purchases') { this.selected = section; }

  openModal() { this.showModal = true; }
  closeModal() {
    this.showModal = false; this.editing = null; this.error='';
    this.form = { nombre: '', email: '', telefono: '', ubicacion: '', ciudad: '', pais: '', notas: '' };
  }

  loadSuppliers() {
    if (!this.projectId) { console.warn('No hay proyecto seleccionado'); return; }
    this.suppliersApi.getSuppliers(this.projectId).subscribe({
      next: (list) => { this.suppliers = list; },
      error: () => { /* noop */ }
    });
  }

  editSupplier(s: SupplierDto) {
    this.editing = s;
    this.form = { nombre: s.nombre, email: s.email || '', telefono: s.telefono || '', ubicacion: s.ubicacion || '', ciudad: s.ciudad || '', pais: s.pais || '', notas: s.notas || '' };
    this.showModal = true;
  }

  saveSupplier() {
    if (!this.form.nombre) { this.error = 'El nombre es obligatorio'; return; }
    if (!this.projectId) { this.error = 'No hay proyecto seleccionado'; return; }
    this.loading = true; this.error = '';
    const data: Partial<SupplierDto> = { projectId: this.projectId, ...this.form };
    const op = this.editing ? this.suppliersApi.updateSupplier(this.editing._id!, data) : this.suppliersApi.createSupplier(data);
    op.subscribe({
      next: () => { this.loading = false; this.closeModal(); this.loadSuppliers(); },
      error: () => { this.loading = false; this.error = 'Error al guardar'; }
    });
  }

  deleteSupplier(s: SupplierDto) {
    if (!confirm(`¿Eliminar ${s.nombre}?`)) return;
    this.suppliersApi.deleteSupplier(s._id!).subscribe({ next: () => this.loadSuppliers() });
  }
  addContact() { alert('Añadir contacto'); }
  addPurchase() { alert('Nueva compra'); }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}


