import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { ProjectContextService } from '../services/project-context.service';
import { CustomerOrdersService, CustomerOrderDto } from '../services/customer-orders.service';
import { CustomersService, CustomerDto } from '../services/customers.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="orders-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content" style="overflow:auto; height:100vh;">
        <div class="orders-container">
          <h2>Pedidos de Clientes</h2>

          <div class="section">
            <div class="actions">
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input class="search" type="text" placeholder="Buscar pedidos..." [(ngModel)]="searchOrders" />
              </div>
              <button class="primary" (click)="addPedido()">Nuevo pedido</button>
            </div>

            <div class="orders-table-wrap" *ngIf="filteredOrders.length > 0; else emptyOrders">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th style="width: 50px;"></th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th class="right">Cantidad</th>
                    <th>Entrega</th>
                    <th>Notas</th>
                    <th>Factura</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of filteredOrders">
                    <td>
                      <button class="edit-order-btn" (click)="openEditOrderModal(o)" title="Editar pedido">
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                    <td>{{ o.fecha }}</td>
                    <td>{{ o.hora }}</td>
                    <td>{{ o.customerNombre }}</td>
                    <td>{{ o.productos }}</td>
                    <td class="right">{{ o.cantidad }}</td>
                    <td>{{ o.entrega || '—' }}</td>
                    <td class="notes-cell">
                      <span style="word-wrap: break-word; white-space: normal; display: block;">{{ o.notas || '—' }}</span>
                    </td>
                    <td class="facturas-cell">
                      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: nowrap;">
                        <button *ngIf="o.facturaPdf" class="invoice-btn" (click)="downloadInvoice(o)" [title]="'Ver ' + o.facturaPdf" style="flex: 1; min-width: 0;">
                          <i class="fas fa-file-pdf"></i> <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ o.facturaPdf.length > 20 ? (o.facturaPdf.substring(0, 20) + '...') : o.facturaPdf }}</span>
                        </button>
                        <button *ngIf="o.facturaPdf" class="delete-invoice-btn" (click)="deleteInvoice(o)" title="Eliminar factura" style="flex-shrink: 0;">
                          <i class="fas fa-trash"></i>
                        </button>
                        <button *ngIf="!o.facturaPdf" class="add-invoice-btn" (click)="openInvoiceModal(o)" title="Añadir factura">
                          <i class="fas fa-plus"></i> Añadir factura
                        </button>
                      </div>
                    </td>
                    <td>
                      <button class="status-btn" 
                              [class.sent]="o.estado === 'enviado'"
                              [class.done]="o.estado === 'completado'"
                              [class.canceled]="o.estado === 'cancelado'"
                              (click)="openEstadoModal(o)">
                        {{ o.estado === 'completado' ? 'Completado' : (o.estado === 'enviado' ? 'Enviado' : (o.estado === 'cancelado' ? 'Cancelado' : 'Pendiente')) }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #emptyOrders>
              <div class="card" style="text-align: center; color: #6b7280;">No hay pedidos registrados.</div>
            </ng-template>
          </div>

          <!-- Modal pedido (crear/editar) -->
          <div class="modal-backdrop" *ngIf="showOrderModal" (click)="closeOrderModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>{{ editingOrder ? 'Editar pedido' : 'Nuevo pedido' }}</h3>
              <div class="modal-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Cliente *</label>
                    <input type="text" [(ngModel)]="orderForm.customerNombre" list="customersList" placeholder="Nombre del cliente" />
                    <datalist id="customersList">
                      <option *ngFor="let c of customers" [value]="c.nombre"></option>
                    </datalist>
                  </div>
                  <div class="form-group">
                    <label>Productos/Servicios *</label>
                    <input type="text" [(ngModel)]="orderForm.productos" placeholder="Productos o servicios solicitados" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Fecha del pedido *</label>
                    <input type="date" [(ngModel)]="orderForm.fecha" />
                  </div>
                  <div class="form-group">
                    <label>Hora *</label>
                    <input type="time" [(ngModel)]="orderForm.hora" />
                  </div>
                  <div class="form-group">
                    <label>Cantidad *</label>
                    <input type="number" [(ngModel)]="orderForm.cantidad" min="0" step="0.01" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Fecha de entrega (opcional)</label>
                    <input type="date" [(ngModel)]="orderForm.entrega" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Notas</label>
                  <textarea rows="3" [(ngModel)]="orderForm.notas" placeholder="Notas del pedido..."></textarea>
                </div>
                <div class="form-row" *ngIf="editingOrder">
                  <div class="form-group">
                    <label>Estado</label>
                    <select [(ngModel)]="orderForm.estado">
                      <option value="pendiente">Pendiente</option>
                      <option value="enviado">Enviado</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Factura PDF (opcional)</label>
                  <input type="file" accept="application/pdf" (change)="onInvoiceFileSelected($event)" />
                  <small style="color: #666; font-size: 12px; margin-top: 4px; display: block;">Solo archivos PDF. Máximo 10MB.</small>
                  <span *ngIf="orderForm.invoiceFile" style="color: #059669; font-size: 12px; margin-top: 4px; display: block;">
                    <i class="fas fa-check-circle"></i> {{ orderForm.invoiceFile.name }}
                  </span>
                  <small *ngIf="editingOrder && editingOrder.facturaPdf" style="color: #666; font-size: 12px; margin-top: 8px; display: block;">
                    Factura actual: {{ editingOrder.facturaPdf }}. Se reemplazará con la nueva.
                  </small>
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeOrderModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="saveOrder()" [disabled]="!orderForm.customerNombre || !orderForm.productos || !orderForm.fecha || !orderForm.hora">Guardar</button>
              </div>
            </div>
          </div>

          <!-- Modal añadir/editar factura -->
          <div class="modal-backdrop" *ngIf="showInvoiceModal" (click)="closeInvoiceModal()">
            <div class="modal-content small" (click)="$event.stopPropagation()">
              <h3>{{ selectedOrderForInvoice?.facturaPdf ? 'Cambiar factura' : 'Añadir factura' }}</h3>
              <div class="modal-form">
                <div class="form-group">
                  <label>Factura PDF *</label>
                  <input type="file" accept="application/pdf" (change)="onInvoiceFileSelectedForOrder($event)" />
                  <small style="color: #666; font-size: 12px; margin-top: 4px; display: block;">Solo archivos PDF. Máximo 10MB.</small>
                  <span *ngIf="invoiceFileForOrder" style="color: #059669; font-size: 12px; margin-top: 4px; display: block;">
                    <i class="fas fa-check-circle"></i> {{ invoiceFileForOrder.name }}
                  </span>
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeInvoiceModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="saveInvoiceToOrder()" [disabled]="!invoiceFileForOrder">{{ selectedOrderForInvoice?.facturaPdf ? 'Reemplazar' : 'Guardar' }}</button>
              </div>
            </div>
          </div>

          <!-- Modal seleccionar estado -->
          <div class="modal-backdrop" *ngIf="showEstadoModal" (click)="closeEstadoModal()">
            <div class="modal-content small" (click)="$event.stopPropagation()">
              <h3>Cambiar estado del pedido</h3>
              <div class="estado-options">
                <button class="estado-option" 
                        [class.active]="selectedEstado === 'pendiente'"
                        (click)="selectedEstado = 'pendiente'">
                  <span class="estado-badge pendiente-badge"></span>
                  <span>Pendiente</span>
                </button>
                <button class="estado-option" 
                        [class.active]="selectedEstado === 'enviado'"
                        (click)="selectedEstado = 'enviado'">
                  <span class="estado-badge sent-badge"></span>
                  <span>Enviado</span>
                </button>
                <button class="estado-option" 
                        [class.active]="selectedEstado === 'completado'"
                        (click)="selectedEstado = 'completado'">
                  <span class="estado-badge done-badge"></span>
                  <span>Completado</span>
                </button>
                <button class="estado-option" 
                        [class.active]="selectedEstado === 'cancelado'"
                        (click)="selectedEstado = 'cancelado'">
                  <span class="estado-badge canceled-badge"></span>
                  <span>Cancelado</span>
                </button>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeEstadoModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="saveEstado()">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .orders-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .orders-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; font-size: 24px; }

    .section { }
    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 20px 0; }
    .search-wrap { position: relative; }
    .search { min-width: 420px; border: 1px solid #ccc; border-radius: 8px; padding: 10px 12px 10px 36px; outline: none; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 14px; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .orders-table-wrap { background: #fff; border: 1px solid #ccc; border-radius: 12px; padding: 12px; }
    .orders-table { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: auto; }
    .orders-table th, .orders-table td { padding: 10px 8px; border-bottom: 1px solid #eee; text-align: left; white-space: nowrap; vertical-align: top; }
    .orders-table th.right, .orders-table td.right { text-align: right; font-variant-numeric: tabular-nums; }
    .orders-table td.notes-cell { white-space: normal; }
    .orders-table td.notes-cell > span { word-wrap: break-word; white-space: normal; display: block; max-width: 300px; }
    .orders-table td.facturas-cell { white-space: normal; min-width: 200px; }
    .orders-table td.facturas-cell > div > div { white-space: normal; }
    .status-btn { padding: 6px 10px; border-radius: 999px; border: 1px solid #fb923c; background: #fff7ed; color: #c2410c; font-size: 12px; cursor: pointer; }
    .status-btn.sent { background: #dbeafe; border-color: #3b82f6; color: #1e40af; }
    .status-btn.done { background: #e7f5eb; border-color: #34d399; color: #065f46; }
    .status-btn.canceled { background: #fee2e2; border-color: #ef4444; color: #991b1b; }
    .invoice-btn { padding: 6px 10px; border-radius: 6px; border: 1px solid #dc2626; background: #fee2e2; color: #dc2626; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .invoice-btn:hover { background: #fecaca; }
    .invoice-btn i { font-size: 14px; }
    .delete-invoice-btn { padding: 6px 8px; border-radius: 6px; border: 1px solid #dc2626; background: #fee2e2; color: #dc2626; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .delete-invoice-btn:hover { background: #fecaca; }
    .delete-invoice-btn i { font-size: 12px; }
    .add-invoice-btn { padding: 0; border: none; background: transparent; color: #2563eb; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
    .add-invoice-btn:hover { color: #1d4ed8; }
    .add-invoice-btn i { font-size: 11px; }
    .edit-order-btn { padding: 6px 10px; border-radius: 6px; border: 1px solid #3b82f6; background: #eff6ff; color: #2563eb; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .edit-order-btn:hover { background: #dbeafe; border-color: #2563eb; color: #1d4ed8; }
    .edit-order-btn i { font-size: 14px; }

    .modal-content.small { max-width: 400px; }
    .estado-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .estado-option { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid #ccc; border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s ease; }
    .estado-option:hover { border-color: #d1d5db; background: #f9fafb; }
    .estado-option.active { border-color: #111; background: #f9fafb; }
    .estado-badge { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }
    .pendiente-badge { background: #fb923c; }
    .sent-badge { background: #3b82f6; }
    .done-badge { background: #34d399; }
    .canceled-badge { background: #ef4444; }

    .empty-state { text-align: center; padding: 140px 20px 80px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0; color: #9ca3af; }

    .card { border: 1px solid #ccc; border-radius: 10px; padding: 14px; background: #fff; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-content h3 { margin: 0 0 20px 0; font-size: 20px; font-weight: 600; }
    .modal-form { margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #333; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; box-sizing: border-box; }
    .form-group input[type="file"] { padding: 8px; cursor: pointer; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: #111; }
    .form-group select:disabled { background: #f3f4f6; color: #6b7280; cursor: not-allowed; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .modal-btn { padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; border: none; transition: opacity 0.2s ease; }
    .cancel-btn { background: #f3f4f6; color: #333; }
    .cancel-btn:hover { background: #e5e7eb; }
    .primary-btn { background: #111; color: white; }
    .primary-btn:hover { opacity: 0.9; }
    .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #dc2626; font-size: 14px; display: block; margin-top: 8px; }

    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions { flex-direction: column; align-items: stretch; } .search { min-width: 100%; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class OrdersComponent implements OnInit {
  showProfile: boolean = false;
  projectId: string | null = null;
  orders: CustomerOrderDto[] = [];
  customers: CustomerDto[] = [];
  searchOrders: string = '';
  showOrderModal: boolean = false;
  editingOrder: CustomerOrderDto | null = null;
  orderForm: any = { customerNombre: '', productos: '', fecha: '', hora: '', cantidad: 0, entrega: '', notas: '', invoiceFile: null, estado: 'pendiente' };
  showEstadoModal: boolean = false;
  selectedEstadoOrder: CustomerOrderDto | null = null;
  selectedEstado: 'pendiente' | 'enviado' | 'completado' | 'cancelado' = 'pendiente';
  showInvoiceModal: boolean = false;
  selectedOrderForInvoice: CustomerOrderDto | null = null;
  invoiceFileForOrder: File | null = null;

  constructor(
    private projectCtx: ProjectContextService,
    private ordersService: CustomerOrdersService,
    private customersService: CustomersService
  ) {}

  ngOnInit() {
    this.projectCtx.currentProject$.subscribe(project => {
      if (project?._id) {
        this.projectId = project._id;
        this.loadOrders();
        this.loadCustomers();
      }
    });
  }

  get filteredOrders() {
    if (!this.searchOrders) return this.orders;
    const query = this.searchOrders.toLowerCase();
    return this.orders.filter(o =>
      o.customerNombre?.toLowerCase().includes(query) ||
      o.productos?.toLowerCase().includes(query) ||
      o.notas?.toLowerCase().includes(query) ||
      o.fecha?.includes(query)
    );
  }

  loadOrders() {
    if (!this.projectId) return;
    this.ordersService.list(this.projectId).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (err) => {
        console.error('Error cargando pedidos:', err);
      }
    });
  }

  loadCustomers() {
    if (!this.projectId) return;
    this.customersService.getCustomers(this.projectId, true).subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
      }
    });
  }

  addPedido() {
    this.editingOrder = null;
    this.orderForm = {
      customerNombre: '',
      productos: '',
      fecha: new Date().toISOString().slice(0,10),
      hora: new Date().toTimeString().slice(0,5),
      cantidad: 0,
      entrega: '',
      notas: '',
      invoiceFile: null,
      estado: 'pendiente'
    };
    this.showOrderModal = true;
  }

  closeOrderModal() { 
    this.showOrderModal = false;
    this.editingOrder = null;
    this.orderForm = { customerNombre: '', productos: '', fecha: '', hora: '', cantidad: 0, entrega: '', notas: '', invoiceFile: null, estado: 'pendiente' };
  }

  openEditOrderModal(order: CustomerOrderDto) {
    this.editingOrder = order;
    this.orderForm = {
      customerNombre: order.customerNombre || '',
      productos: order.productos || '',
      fecha: order.fecha || '',
      hora: order.hora || '',
      cantidad: order.cantidad || 0,
      entrega: order.entrega || '',
      notas: order.notas || '',
      invoiceFile: null,
      estado: order.estado || 'pendiente'
    };
    this.showOrderModal = true;
  }

  saveOrder() {
    if (!this.projectId) { this.closeOrderModal(); return; }
    
    if (this.editingOrder && this.editingOrder._id) {
      const updatePayload: Partial<CustomerOrderDto> = {
        customerNombre: this.orderForm.customerNombre,
        productos: this.orderForm.productos,
        fecha: this.orderForm.fecha,
        hora: this.orderForm.hora || new Date().toTimeString().slice(0,5),
        cantidad: Number(this.orderForm.cantidad) || 0,
        entrega: this.orderForm.entrega || '',
        notas: this.orderForm.notas || '',
        estado: this.orderForm.estado || 'pendiente'
      };
      
      this.ordersService.update(this.editingOrder._id, updatePayload, this.orderForm.invoiceFile || undefined).subscribe({
        next: () => { 
          this.closeOrderModal(); 
          this.loadOrders(); 
        },
        error: (err) => { 
          console.error('Error actualizando pedido:', err);
          this.closeOrderModal(); 
        }
      });
    } else {
      const payload: CustomerOrderDto = {
        projectId: this.projectId,
        customerNombre: this.orderForm.customerNombre,
        productos: this.orderForm.productos,
        fecha: this.orderForm.fecha,
        hora: this.orderForm.hora || new Date().toTimeString().slice(0,5),
        cantidad: Number(this.orderForm.cantidad) || 0,
        entrega: this.orderForm.entrega || '',
        notas: this.orderForm.notas || '',
        estado: 'pendiente'
      };
      this.ordersService.create(payload, this.orderForm.invoiceFile || undefined).subscribe({
        next: () => { this.closeOrderModal(); this.loadOrders(); },
        error: () => { this.closeOrderModal(); }
      });
    }
  }

  onInvoiceFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        event.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB');
        event.target.value = '';
        return;
      }
      this.orderForm.invoiceFile = file;
    }
  }

  downloadInvoice(order: CustomerOrderDto) {
    if (!order._id || !order.facturaPdf) return;
    const url = this.ordersService.getInvoiceUrl(order._id);
    window.open(url, '_blank');
  }

  deleteInvoice(order: CustomerOrderDto) {
    if (!order._id || !order.facturaPdf) return;
    
    if (!confirm(`¿Seguro que quieres eliminar la factura del pedido de "${order.customerNombre}"?`)) {
      return;
    }
    
    this.ordersService.deleteInvoice(order._id).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error eliminando factura:', err);
        alert('Error al eliminar la factura');
      }
    });
  }

  openInvoiceModal(order: CustomerOrderDto) {
    this.selectedOrderForInvoice = order;
    this.invoiceFileForOrder = null;
    this.showInvoiceModal = true;
  }

  closeInvoiceModal() {
    this.showInvoiceModal = false;
    this.selectedOrderForInvoice = null;
    this.invoiceFileForOrder = null;
  }

  onInvoiceFileSelectedForOrder(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        event.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB');
        event.target.value = '';
        return;
      }
      this.invoiceFileForOrder = file;
    }
  }

  saveInvoiceToOrder() {
    if (!this.selectedOrderForInvoice?._id || !this.invoiceFileForOrder) return;
    
    this.ordersService.update(this.selectedOrderForInvoice._id, {}, this.invoiceFileForOrder).subscribe({
      next: () => {
        this.closeInvoiceModal();
        this.loadOrders();
      },
      error: (err: any) => {
        console.error('Error guardando factura:', err);
        alert('Error al guardar la factura');
      }
    });
  }

  openEstadoModal(o: CustomerOrderDto) {
    this.selectedEstadoOrder = o;
    this.selectedEstado = (o.estado || 'pendiente') as 'pendiente' | 'enviado' | 'completado' | 'cancelado';
    this.showEstadoModal = true;
  }

  closeEstadoModal() {
    this.showEstadoModal = false;
    this.selectedEstadoOrder = null;
  }

  saveEstado() {
    if (!this.selectedEstadoOrder?._id) {
      this.closeEstadoModal();
      return;
    }
    const prev = this.selectedEstadoOrder.estado;
    this.selectedEstadoOrder.estado = this.selectedEstado as any;
    this.ordersService.update(this.selectedEstadoOrder._id, { estado: this.selectedEstado }).subscribe({
      next: (updated) => {
        if (this.selectedEstadoOrder) {
          this.selectedEstadoOrder.estado = updated.estado;
        }
        this.closeEstadoModal();
      },
      error: () => {
        if (this.selectedEstadoOrder) {
          this.selectedEstadoOrder.estado = prev;
        }
        this.closeEstadoModal();
      }
    });
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}
