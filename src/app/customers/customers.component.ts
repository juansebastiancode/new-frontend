import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { CustomersService, CustomerDto } from '../services/customers.service';
import { ProjectContextService } from '../services/project-context.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="customers-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content" style="overflow:auto; height:100vh;">
        <div class="customers-container">
          <h2>Clientes</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'clients'" (click)="select('clients')">Clientes</button>
            <button class="tab" [class.active]="selected === 'leads'" (click)="select('leads')">Posibles clientes</button>
          </div>

          <div class="section" *ngIf="selected === 'clients'">
            <div class="actions">
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input class="search" type="text" placeholder="Buscar clientes..." [(ngModel)]="searchClients" />
              </div>
              <button class="primary" (click)="showAddModal = true">Añadir cliente</button>
            </div>
            
            
            <div class="customers-grid">
              <div class="customer-card" *ngFor="let customer of filteredClients">
                <div class="customer-header">
                  <div class="customer-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="customer-info">
                    <h3>{{ customer.nombre }}</h3>
                    <p class="customer-detail">{{ customer.email || 'Sin email' }}</p>
                  </div>
                  <div class="status-wrap">
                    <div class="status-chip" [ngClass]="customer.esCliente ? 'chip-cliente' : 'chip-lead'" (click)="toggleStatusMenu(customer._id!)">
                      {{ customer.esCliente ? 'Cliente' : 'Posible cliente' }}
                      <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="status-menu" *ngIf="openStatusMenuId === customer._id">
                      <button class="status-item" [class.active]="customer.esCliente" (click)="changeCustomerType(customer, true)">Cliente</button>
                      <button class="status-item" [class.active]="!customer.esCliente" (click)="changeCustomerType(customer, false)">Posible cliente</button>
                    </div>
                  </div>
                  <div class="customer-actions">
                    <button class="action-btn edit-btn" (click)="editCustomer(customer)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" (click)="deleteCustomer(customer)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="customer-details">
                  <div class="detail-item">
                    <span class="detail-label">Teléfono:</span>
                    <span class="detail-value">{{ customer.telefono || 'No especificado' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Ubicación:</span>
                    <span class="detail-value">{{ customer.ubicacion || 'No especificada' }}</span>
                  </div>
                  <div class="detail-item" *ngIf="customer.ciudad || customer.pais">
                    <span class="detail-label">Ciudad:</span>
                    <span class="detail-value">{{ customer.ciudad }}{{ customer.pais ? ', ' + customer.pais : '' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="filteredClients.length === 0">
              <i class="fas fa-user empty-icon"></i>
              <h3>No hay clientes registrados</h3>
              <p>Comienza agregando tu primer cliente.</p>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'leads'">
            <div class="actions">
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input class="search" type="text" placeholder="Buscar posibles clientes..." [(ngModel)]="searchLeads" />
              </div>
              <button class="primary" (click)="showAddModal = true">Añadir posible cliente</button>
            </div>
            
            
            <div class="customers-grid">
              <div class="customer-card" *ngFor="let lead of filteredLeads">
                <div class="customer-header">
                  <div class="customer-icon">
                    <i class="fas fa-lightbulb"></i>
                  </div>
                  <div class="customer-info">
                    <h3>{{ lead.nombre }}</h3>
                    <p class="customer-detail">{{ lead.email || 'Sin email' }}</p>
                  </div>
                  <div class="status-wrap">
                    <div class="status-chip" [ngClass]="lead.esCliente ? 'chip-cliente' : 'chip-lead'" (click)="toggleStatusMenu(lead._id!)">
                      {{ lead.esCliente ? 'Cliente' : 'Posible cliente' }}
                      <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="status-menu" *ngIf="openStatusMenuId === lead._id">
                      <button class="status-item" [class.active]="lead.esCliente" (click)="changeCustomerType(lead, true)">Cliente</button>
                      <button class="status-item" [class.active]="!lead.esCliente" (click)="changeCustomerType(lead, false)">Posible cliente</button>
                    </div>
                  </div>
                  <div class="customer-actions">
                    <button class="action-btn edit-btn" (click)="editCustomer(lead)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" (click)="deleteCustomer(lead)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="customer-details">
                  <div class="detail-item">
                    <span class="detail-label">Teléfono:</span>
                    <span class="detail-value">{{ lead.telefono || 'No especificado' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Ubicación:</span>
                    <span class="detail-value">{{ lead.ubicacion || 'No especificada' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="filteredLeads.length === 0">
              <i class="fas fa-lightbulb empty-icon"></i>
              <h3>No hay posibles clientes</h3>
              <p>Comienza agregando tu primer lead.</p>
            </div>
          </div>

          <!-- Modal de añadir/editar -->
          <div class="modal-backdrop" *ngIf="showAddModal" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>{{ editingCustomer ? 'Editar ' : 'Nuevo ' }}{{ selected === 'clients' ? 'cliente' : 'posible cliente' }}</h3>
              <div class="modal-form">
                <div class="form-group">
                  <label>Nombre *</label>
                  <input type="text" [(ngModel)]="formData.nombre" placeholder="Nombre del cliente" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="formData.email" placeholder="email@ejemplo.com" />
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input type="text" [(ngModel)]="formData.telefono" placeholder="+34 600 000 000" />
                </div>
                <div class="form-group">
                  <label>Dirección</label>
                  <input type="text" [(ngModel)]="formData.ubicacion" placeholder="Calle, número" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Ciudad</label>
                    <input type="text" [(ngModel)]="formData.ciudad" placeholder="Ciudad" />
                  </div>
                  <div class="form-group">
                    <label>País</label>
                    <input type="text" [(ngModel)]="formData.pais" placeholder="País" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Notas</label>
                  <textarea [(ngModel)]="formData.notas" rows="3" placeholder="Notas adicionales..."></textarea>
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="saveCustomer()" [disabled]="!formData.nombre || loading">{{ loading ? 'Guardando...' : 'Guardar' }}</button>
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
    .customers-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .customers-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; font-size: 24px; }
    .muted { color: #555; font-size: 13px; margin: 0 0 8px 0; }

    .tabs { display: flex; gap: 8px; margin: 8px 0 24px 0; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 14px; transition: all 0.2s ease; }
    .tab.active { background: #111; color: #fff; border-color: #111; }

    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 20px 0; }
    .search-wrap { position: relative; }
    .search { min-width: 420px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px 10px 36px; outline: none; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 14px; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .customers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .customer-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; }
    .customer-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .customer-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .customer-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .customer-icon i { font-size: 20px; color: #6b7280; }
    .customer-info { flex-grow: 1; }
    .customer-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .customer-detail { margin: 0; color: #6b7280; font-size: 14px; }
    .customer-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .customer-details { margin-bottom: 16px; }
    .detail-item { display: flex; margin-bottom: 8px; }
    .detail-label { font-weight: 500; color: #6b7280; min-width: 80px; font-size: 14px; }
    .detail-value { color: #111; font-size: 14px; word-break: break-all; }

    .status-wrap { position: absolute; bottom: 12px; right: 12px; }
    .status-chip { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 6px 10px; cursor: pointer; font-size: 12px; border: 1px solid transparent; }
    .status-chip i { font-size: 10px; color: #6b7280; }
    .status-menu { position: absolute; bottom: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); display: flex; flex-direction: column; min-width: 160px; z-index: 10; }
    .status-item { background: transparent; border: none; text-align: left; padding: 10px 12px; font-size: 13px; cursor: pointer; }
    .status-item:hover { background: #f9fafb; }
    .status-item.active { color: #111; font-weight: 600; }

    .chip-cliente { background: #FEF3C7; color: #92400E; border-color: #FDE68A; }
    .chip-lead { background: #DBEAFE; color: #1E3A8A; border-color: #BFDBFE; }

    .empty-state { text-align: center; padding: 140px 20px 80px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0 0 24px 0; color: #9ca3af; }
    .add-first-btn { background-color: #111; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s ease; }
    .add-first-btn:hover { opacity: 0.9; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-content h3 { margin: 0 0 20px 0; font-size: 20px; font-weight: 600; }
    .modal-form { margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #333; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; box-sizing: border-box; }
    .form-group input:focus, .form-group textarea:focus { border-color: #111; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .modal-btn { padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; border: none; transition: opacity 0.2s ease; }
    .cancel-btn { background: #f3f4f6; color: #333; }
    .cancel-btn:hover { background: #e5e7eb; }
    .primary-btn { background: #111; color: white; }
    .primary-btn:hover { opacity: 0.9; }
    .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #dc2626; font-size: 14px; display: block; margin-top: 8px; }

    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions { flex-direction: column; align-items: stretch; } .search { min-width: 100%; } .customers-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class CustomersComponent implements OnInit {
  showProfile: boolean = false;
  selected: 'leads' | 'clients' = 'clients';
  searchLeads: string = '';
  searchClients: string = '';
  customers: CustomerDto[] = [];
  loading: boolean = false;
  error: string = '';
  showAddModal: boolean = false;
  editingCustomer: CustomerDto | null = null;
  openStatusMenuId: string | null = null;
  formData: any = {
    nombre: '',
    email: '',
    telefono: '',
    ubicacion: '',
    ciudad: '',
    pais: '',
    notas: ''
  };

  constructor(
    private customersService: CustomersService,
    private projectCtx: ProjectContextService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  get projectId(): string | null {
    const currentProject = this.projectCtx.getCurrent();
    return (currentProject as any)?._id || null;
  }

  get filteredClients() {
    const clients = this.customers.filter(c => c.esCliente);
    if (!this.searchClients) return clients;
    return clients.filter(c => 
      c.nombre.toLowerCase().includes(this.searchClients.toLowerCase()) ||
      c.email?.toLowerCase().includes(this.searchClients.toLowerCase()) ||
      c.telefono?.includes(this.searchClients)
    );
  }

  get filteredLeads() {
    const leads = this.customers.filter(c => !c.esCliente);
    if (!this.searchLeads) return leads;
    return leads.filter(c => 
      c.nombre.toLowerCase().includes(this.searchLeads.toLowerCase()) ||
      c.email?.toLowerCase().includes(this.searchLeads.toLowerCase()) ||
      c.telefono?.includes(this.searchLeads)
    );
  }

  select(section: 'leads' | 'clients') { 
    this.selected = section; 
    if (this.showAddModal) {
      this.loadCustomers();
    }
    this.openStatusMenuId = null;
  }

  loadCustomers() {
    if (!this.projectId) {
      console.warn('No hay proyecto seleccionado');
      return;
    }
    
    this.loading = true;
    this.customersService.getCustomers(this.projectId).subscribe({
      next: (customers) => {
        this.customers = customers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.loading = false;
      }
    });
  }

  closeModal() {
    this.showAddModal = false;
    this.editingCustomer = null;
    this.formData = {
      nombre: '',
      email: '',
      telefono: '',
      ubicacion: '',
      ciudad: '',
      pais: '',
      notas: ''
    };
    this.error = '';
  }

  editCustomer(customer: CustomerDto) {
    this.editingCustomer = customer;
    this.formData = {
      nombre: customer.nombre,
      email: customer.email || '',
      telefono: customer.telefono || '',
      ubicacion: customer.ubicacion || '',
      ciudad: customer.ciudad || '',
      pais: customer.pais || '',
      notas: customer.notas || ''
    };
    this.showAddModal = true;
  }

  saveCustomer() {
    if (!this.formData.nombre) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    if (!this.projectId) {
      this.error = 'No hay proyecto seleccionado';
      return;
    }

    this.loading = true;
    this.error = '';

    const customerData: Partial<CustomerDto> = {
      projectId: this.projectId,
      nombre: this.formData.nombre,
      email: this.formData.email,
      telefono: this.formData.telefono,
      ubicacion: this.formData.ubicacion,
      ciudad: this.formData.ciudad,
      pais: this.formData.pais,
      notas: this.formData.notas,
      esCliente: this.selected === 'clients'
    };

    const operation = this.editingCustomer
      ? this.customersService.updateCustomer(this.editingCustomer._id!, customerData)
      : this.customersService.createCustomer(customerData);

    operation.subscribe({
      next: () => {
        this.loadCustomers();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error guardando cliente:', err);
        this.error = 'Error al guardar el cliente';
        this.loading = false;
      }
    });
  }

  deleteCustomer(customer: CustomerDto) {
    if (!confirm(`¿Eliminar ${customer.nombre}?`)) return;

    this.loading = true;
    this.customersService.deleteCustomer(customer._id!).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: (err) => {
        console.error('Error eliminando cliente:', err);
        this.loading = false;
      }
    });
  }

  addLead() { this.selected = 'leads'; this.showAddModal = true; }
  addClient() { this.selected = 'clients'; this.showAddModal = true; }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }

  toggleStatusMenu(id: string) {
    this.openStatusMenuId = this.openStatusMenuId === id ? null : id;
  }

  changeCustomerType(customer: CustomerDto, toClient: boolean) {
    if (customer.esCliente === toClient) {
      this.openStatusMenuId = null;
      return;
    }
    this.openStatusMenuId = null;
    const previous = customer.esCliente;
    customer.esCliente = toClient; // optimista
    this.customersService.updateCustomer(customer._id!, { esCliente: toClient }).subscribe({
      next: () => {
        // recargar para asegurar consistencia y mover entre listas
        this.loadCustomers();
      },
      error: () => {
        customer.esCliente = previous; // revertir si falla
      }
    });
  }
}
