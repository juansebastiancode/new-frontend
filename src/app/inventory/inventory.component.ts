import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { InventoryService, InventoryItemDto } from '../services/inventory.service';
import { ProjectContextService } from '../services/project-context.service';
import { SuppliersService, SupplierDto } from '../services/suppliers.service';
import { InventoryOrdersService, InventoryOrderDto } from '../services/inventory-orders.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="inventory-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content" style="overflow:auto; height:100vh;">
        <div class="inventory-container">
          <h2>Inventario</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'items'" (click)="select('items')">Artículos</button>
            <button class="tab" [class.active]="selected === 'pedidos'" (click)="select('pedidos')">Registro de pedidos</button>
          </div>

          <div class="section" *ngIf="selected === 'items'">
            <div class="actions">
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input class="search" type="text" placeholder="Buscar artículos..." [(ngModel)]="searchItems" />
              </div>
              <button class="primary" (click)="openModal()">Añadir artículo</button>
            </div>
            
            <div class="items-grid">
              <div class="item-card" *ngFor="let item of filteredItems" [class.low-stock]="isLowStock(item)">
                <div class="item-header">
                  <div class="item-icon">
                    <i class="fas fa-box"></i>
                  </div>
                  <div class="item-info">
                    <h3>{{ item.nombre }}</h3>
                    <p class="item-detail">{{ item.categoria || 'Sin categoría' }}</p>
                  </div>
                  <div class="item-actions">
                    <button class="action-btn edit-btn" (click)="editItem(item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" (click)="deleteItem(item)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="item-details">
                  <div class="detail-item">
                    <span class="detail-label">Stock mínimo:</span>
                    <span class="detail-value">{{ item.stockMinimo }} {{ item.unidad }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Proveedor:</span>
                    <span class="detail-value">{{ item.proveedor || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Ubicación:</span>
                    <span class="detail-value">{{ item.ubicacion || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Precio:</span>
                    <span class="detail-value">€ {{ (item.precioUnitario || 0) | number:'1.2-2' }}</span>
                  </div>
                </div>
                <div class="item-footer">
                  <div class="footer-qty">
                    <span class="detail-label">Cantidad:</span>
                    <div class="qty-control">
                      <button class="qty-btn" (click)="changeQuantity(item, -1)">−</button>
                      <span class="detail-value stock-number">{{ item.cantidad }} {{ item.unidad }}</span>
                      <button class="qty-btn" (click)="changeQuantity(item, 1)">+</button>
                    </div>
                  </div>
                  <div class="stock-status" [ngClass]="getStockClass(item)">
                    <span class="status-badge" *ngIf="item.cantidad === 0">
                      <i class="fas fa-times-circle"></i> Sin stock
                    </span>
                    <span class="status-badge" *ngIf="item.cantidad > 0 && isLowStock(item)">
                      <i class="fas fa-exclamation-triangle"></i> Pedir
                    </span>
                    <span class="status-badge" *ngIf="item.cantidad > 0 && !isLowStock(item)">
                      <i class="fas fa-check-circle"></i> En stock
                    </span>
                  </div>
                </div>
                <div class="supplier-contact" *ngIf="(item.cantidad === 0 || isLowStock(item)) && supplierFor(item.proveedor)">
                  <div class="contact-title"><i class="far fa-address-book"></i> Contacto del proveedor</div>
                  <div class="contact-row">
                    <span class="contact-label">Proveedor:</span>
                    <span class="contact-value">{{ supplierFor(item.proveedor)?.nombre }}</span>
                  </div>
                  <div class="contact-row" *ngIf="supplierFor(item.proveedor)?.email">
                    <span class="contact-label">Email:</span>
                    <span class="contact-value">{{ supplierFor(item.proveedor)?.email }}</span>
                  </div>
                  <div class="contact-row" *ngIf="supplierFor(item.proveedor)?.telefono">
                    <span class="contact-label">Teléfono:</span>
                    <span class="contact-value">{{ supplierFor(item.proveedor)?.telefono }}</span>
                  </div>
                  <div class="contact-actions">
                    <button class="primary small" (click)="openOrderModalFromItem(item)">
                      <i class="fas fa-plus"></i>
                      Añadir registro de pedido
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="filteredItems.length === 0">
              <i class="fas fa-box empty-icon"></i>
              <h3>No hay artículos</h3>
              <p>Comienza agregando tu primer artículo al inventario.</p>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'pedidos'">
            <div class="actions">
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input class="search" type="text" placeholder="Buscar pedidos..." [(ngModel)]="searchPedidos" />
              </div>
              <button class="primary" (click)="addPedido()">Nuevo pedido</button>
            </div>
            <p class="muted">Registra y gestiona tus pedidos a proveedores.</p>
              <div class="orders-table-wrap" *ngIf="filteredOrders.length > 0; else emptyOrders">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Artículo</th>
                    <th>Proveedor</th>
                    <th class="right">Cantidad</th>
                    <th>Llegada</th>
                    <th>Notas</th>
                      <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of filteredOrders">
                    <td>{{ o.fecha }}</td>
                    <td>{{ o.hora }}</td>
                    <td>{{ o.itemNombre }}</td>
                    <td>{{ o.proveedor }}</td>
                    <td class="right">{{ o.cantidad }}</td>
                    <td>{{ o.llegada || '—' }}</td>
                    <td>{{ o.notas || '—' }}</td>
                      <td>
                        <button class="status-btn" 
                                [class.done]="o.estado === 'completado'"
                                [class.canceled]="o.estado === 'cancelado'"
                                (click)="openEstadoModal(o)">
                          {{ o.estado === 'completado' ? 'Completado' : (o.estado === 'cancelado' ? 'Cancelado' : 'Pendiente') }}
                        </button>
                      </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #emptyOrders>
              <div class="card">No hay pedidos registrados.</div>
            </ng-template>
          </div>

          <!-- Modal añadir/editar artículo -->
          <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>{{ editing ? 'Editar artículo' : 'Nuevo artículo' }}</h3>
              <div class="modal-form">
                <div class="form-group">
                  <label>Nombre *</label>
                  <input type="text" [(ngModel)]="form.nombre" placeholder="Nombre del artículo" />
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea rows="2" [(ngModel)]="form.descripcion" placeholder="Descripción del artículo"></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Categoría</label>
                    <input type="text" [(ngModel)]="form.categoria" placeholder="Categoría" />
                  </div>
                  <div class="form-group">
                    <label>Unidad</label>
                    <select [(ngModel)]="form.unidad">
                      <option value="unidad">Unidad</option>
                      <option value="kg">Kg</option>
                      <option value="litro">Litro</option>
                      <option value="metro">Metro</option>
                      <option value="caja">Caja</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Cantidad *</label>
                    <input type="number" [(ngModel)]="form.cantidad" placeholder="0" min="0" step="0.01" />
                  </div>
                  <div class="form-group">
                    <label>Stock mínimo</label>
                    <input type="number" [(ngModel)]="form.stockMinimo" placeholder="0" min="0" step="0.01" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Precio unitario (€)</label>
                    <input type="number" [(ngModel)]="form.precioUnitario" placeholder="0.00" min="0" step="0.01" />
                  </div>
                  <div class="form-group">
                    <label>Código/SKU</label>
                    <input type="text" [(ngModel)]="form.codigo" placeholder="Código de barras" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Proveedor</label>
                    <input type="text" [(ngModel)]="form.proveedor" placeholder="Nombre del proveedor" list="suppliersList" />
                  </div>
                  <div class="form-group">
                    <label>Ubicación</label>
                    <input type="text" [(ngModel)]="form.ubicacion" placeholder="Ubicación física" />
                  </div>
                </div>
                <datalist id="suppliersList">
                  <option *ngFor="let s of suppliers" [value]="s.nombre"></option>
                </datalist>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="saveItem()" [disabled]="!form.nombre || loading">
                  {{ loading ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
              <span class="error" *ngIf="error">{{ error }}</span>
            </div>
          </div>

          <!-- Modal registro de pedido -->
          <div class="modal-backdrop" *ngIf="showOrderModal" (click)="closeOrderModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>Nuevo registro de pedido</h3>
              <div class="modal-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Artículo</label>
                    <select [(ngModel)]="orderForm.articulo" [disabled]="orderForm.fromItem">
                      <option value="">Selecciona un artículo</option>
                      <option *ngFor="let item of items" [value]="item.nombre">{{ item.nombre }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Proveedor</label>
                    <input type="text" [(ngModel)]="orderForm.proveedor" list="suppliersListOrder" placeholder="Proveedor" />
                    <datalist id="suppliersListOrder">
                      <option *ngFor="let s of suppliers" [value]="s.nombre"></option>
                    </datalist>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Fecha del pedido</label>
                    <input type="date" [(ngModel)]="orderForm.fecha" />
                  </div>
                  <div class="form-group">
                    <label>Hora</label>
                    <input type="time" [(ngModel)]="orderForm.hora" />
                  </div>
                  <div class="form-group">
                    <label>Cantidad</label>
                    <input type="number" [(ngModel)]="orderForm.cantidad" min="0" step="0.01" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Día de llegada (opcional)</label>
                    <input type="date" [(ngModel)]="orderForm.llegada" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Anotaciones</label>
                  <textarea rows="3" [(ngModel)]="orderForm.notas" placeholder="Notas del pedido..."></textarea>
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel-btn" (click)="closeOrderModal()">Cancelar</button>
                <button class="modal-btn primary-btn" (click)="saveOrder()">Guardar</button>
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
    .inventory-page { width: 100%; height: 100vh; background: white; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .inventory-container { padding: 24px; }
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

    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .item-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .item-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .item-card.low-stock { border-left: 4px solid #ef4444; }
    .item-header { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .item-icon { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .item-icon i { font-size: 20px; color: #6b7280; }
    .item-info { flex-grow: 1; min-width: 0; }
    .item-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
    .item-detail { margin: 0; color: #6b7280; font-size: 14px; }
    .item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 16px; }
    .footer-qty { display: inline-flex; align-items: center; gap: 10px; }
    .footer-qty .detail-label { color: #374151; }
    .stock-status { margin: 0; display: flex; align-items: center; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .status-badge i { font-size: 10px; }
    .stock-status .status-badge { background: #f3f4f6; color: #6b7280; }
    .stock-status.warning .status-badge { background: #fef2f2; color: #dc2626; }
    .stock-status.success .status-badge { background: #f0fdf4; color: #16a34a; }
    .stock-status.danger .status-badge { background: #fee2e2; color: #991b1b; }
    .item-actions { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
    .edit-btn { background: #f3f4f6; color: #6b7280; }
    .edit-btn:hover { background: #e5e7eb; }
    .delete-btn { background: #fef2f2; color: #ef4444; }
    .delete-btn:hover { background: #fee2e2; }
    .item-details { margin-bottom: 12px; display:flex; align-items:center; gap: 12px; flex-wrap: wrap; white-space: normal; padding-left: 12px; }
    .detail-item { display: inline-flex; align-items: center; gap: 6px; margin: 0; padding-left: 12px; border-left: 1px solid #eee; }
    .detail-label { font-weight: 500; color: #6b7280; font-size: 14px; margin: 0; min-width: auto; }
    .detail-value { color: #111; font-size: 14px; word-break: keep-all; }
    .stock-number { font-weight: 700; font-size: 16px; white-space: nowrap; }
    .qty-control { display: inline-flex; align-items: center; gap: 10px; }
    .qty-btn { width: 30px; height: 30px; line-height: 30px; text-align: center; border: 1px solid #e5e7eb; background: #f9fafb; color: #111; border-radius: 6px; cursor: pointer; flex-shrink: 0; }
    .qty-btn:disabled { opacity: .6; cursor: not-allowed; }

    .supplier-contact { background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; margin-top:10px; }
    .contact-title { font-size:12px; font-weight:700; color:#374151; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
    .contact-row { display:flex; align-items:center; gap:6px; font-size:13px; }
    .contact-label { color:#6b7280; min-width:80px; }
    .contact-value { color:#111; }
    .contact-actions { display:flex; justify-content:flex-end; margin-top:8px; }
    .primary.small { background:#111; color:#fff; border:none; border-radius:8px; padding:8px 10px; cursor:pointer; font-size:13px; }

    .orders-table-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
    .orders-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .orders-table th, .orders-table td { padding: 10px 8px; border-bottom: 1px solid #eee; text-align: left; }
    .orders-table th.right, .orders-table td.right { text-align: right; font-variant-numeric: tabular-nums; }
    .status-btn { padding: 6px 10px; border-radius: 999px; border: 1px solid #fb923c; background: #fff7ed; color: #c2410c; font-size: 12px; cursor: pointer; }
    .status-btn.done { background: #e7f5eb; border-color: #34d399; color: #065f46; }
    .status-btn.canceled { background: #fee2e2; border-color: #ef4444; color: #991b1b; }

    .modal-content.small { max-width: 400px; }
    .estado-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .estado-option { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s ease; }
    .estado-option:hover { border-color: #d1d5db; background: #f9fafb; }
    .estado-option.active { border-color: #111; background: #f9fafb; }
    .estado-badge { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }
    .pendiente-badge { background: #fb923c; }
    .done-badge { background: #34d399; }
    .canceled-badge { background: #ef4444; }

    .empty-state { text-align: center; padding: 140px 20px 80px; color: #6b7280; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: #d1d5db; }
    .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #6b7280; }
    .empty-state p { margin: 0; color: #9ca3af; }

    .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; background: #fff; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-content h3 { margin: 0 0 20px 0; font-size: 20px; font-weight: 600; }
    .modal-form { margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #333; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease; box-sizing: border-box; }
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

    @media (max-width: 768px) { .main-content { margin-left: 0; } .actions { flex-direction: column; align-items: stretch; } .search { min-width: 100%; } .items-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class InventoryComponent implements OnInit {
  showProfile: boolean = false;
  selected: 'items' | 'pedidos' = 'items';
  searchItems: string = '';
  searchPedidos: string = '';
  items: InventoryItemDto[] = [];
  orders: InventoryOrderDto[] = [];
  suppliers: SupplierDto[] = [];
  loading: boolean = false;
  error: string = '';
  showModal: boolean = false;
  editing: InventoryItemDto | null = null;
  savingId: string | null = null;
  showOrderModal: boolean = false;
  orderForm: any = { articulo: '', proveedor: '', fecha: '', hora: '', cantidad: 0, llegada: '', notas: '', fromItem: false };
  showEstadoModal: boolean = false;
  selectedEstadoOrder: InventoryOrderDto | null = null;
  selectedEstado: 'pendiente' | 'completado' | 'cancelado' = 'pendiente';
  form: any = {
    nombre: '',
    descripcion: '',
    categoria: '',
    cantidad: 0,
    stockMinimo: 0,
    unidad: 'unidad',
    precioUnitario: 0,
    proveedor: '',
    ubicacion: '',
    codigo: ''
  };

  constructor(
    private inventoryService: InventoryService,
    private projectCtx: ProjectContextService,
    private suppliersService: SuppliersService,
    private ordersService: InventoryOrdersService
  ) {}

  ngOnInit() {
    this.loadItems();
    this.loadSuppliers();
    this.loadOrders();
  }

  get projectId(): string | null {
    const currentProject = this.projectCtx.getCurrent();
    return (currentProject as any)?._id || null;
  }

  get filteredOrders() {
    if (!this.searchPedidos) return this.orders;
    return this.orders.filter(o =>
      o.itemNombre.toLowerCase().includes(this.searchPedidos.toLowerCase()) ||
      o.proveedor.toLowerCase().includes(this.searchPedidos.toLowerCase())
    );
  }

  get filteredItems() {
    if (!this.searchItems) return this.items;
    return this.items.filter(item => 
      item.nombre.toLowerCase().includes(this.searchItems.toLowerCase()) ||
      item.categoria?.toLowerCase().includes(this.searchItems.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(this.searchItems.toLowerCase())
    );
  }

  select(section: 'items' | 'pedidos') { 
    this.selected = section; 
    if (section === 'pedidos') this.loadOrders();
  }

  isLowStock(item: InventoryItemDto): boolean {
    return item.stockMinimo > 0 && item.cantidad <= item.stockMinimo;
  }

  needsReorder(item: InventoryItemDto): boolean {
    return item.cantidad === 0 || (item.stockMinimo > 0 && item.cantidad <= item.stockMinimo);
  }

  getStockClass(item: InventoryItemDto): string {
    if (item.cantidad === 0) return 'danger';
    if (this.isLowStock(item)) return 'warning';
    return 'success';
  }

  loadItems() {
    if (!this.projectId) {
      console.warn('No hay proyecto seleccionado');
      return;
    }
    
    this.loading = true;
    this.inventoryService.getItems(this.projectId).subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando artículos:', err);
        this.loading = false;
      }
    });
  }

  loadSuppliers() {
    if (!this.projectId) return;
    this.suppliersService.getSuppliers(this.projectId).subscribe({
      next: (list) => { this.suppliers = list; },
      error: () => { this.suppliers = []; }
    });
  }

  loadOrders() {
    if (!this.projectId) return;
    this.ordersService.list(this.projectId).subscribe({
      next: (orders) => { this.orders = orders; },
      error: () => { this.orders = []; }
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editing = null;
    this.form = {
      nombre: '',
      descripcion: '',
      categoria: '',
      cantidad: 0,
      stockMinimo: 0,
      unidad: 'unidad',
      precioUnitario: 0,
      proveedor: '',
      ubicacion: '',
      codigo: ''
    };
    this.error = '';
  }

  editItem(item: InventoryItemDto) {
    this.editing = item;
    this.form = {
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      categoria: item.categoria || '',
      cantidad: item.cantidad,
      stockMinimo: item.stockMinimo,
      unidad: item.unidad || 'unidad',
      precioUnitario: item.precioUnitario || 0,
      proveedor: item.proveedor || '',
      ubicacion: item.ubicacion || '',
      codigo: item.codigo || ''
    };
    this.showModal = true;
  }

  saveItem() {
    if (!this.form.nombre) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    if (!this.projectId) {
      this.error = 'No hay proyecto seleccionado';
      return;
    }

    this.loading = true;
    this.error = '';

    const itemData: Partial<InventoryItemDto> = {
      projectId: this.projectId,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion,
      categoria: this.form.categoria,
      cantidad: Number(this.form.cantidad) || 0,
      stockMinimo: Number(this.form.stockMinimo) || 0,
      unidad: this.form.unidad,
      precioUnitario: Number(this.form.precioUnitario) || 0,
      proveedor: this.form.proveedor,
      ubicacion: this.form.ubicacion,
      codigo: this.form.codigo
    };

    const operation = this.editing
      ? this.inventoryService.updateItem(this.editing._id!, itemData)
      : this.inventoryService.createItem(itemData);

    operation.subscribe({
      next: () => {
        this.loadItems();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error guardando artículo:', err);
        this.error = 'Error al guardar el artículo';
        this.loading = false;
      }
    });
  }

  deleteItem(item: InventoryItemDto) {
    if (!confirm(`¿Eliminar ${item.nombre}?`)) return;

    this.loading = true;
    this.inventoryService.deleteItem(item._id!).subscribe({
      next: () => {
        this.loadItems();
      },
      error: (err) => {
        console.error('Error eliminando artículo:', err);
        this.loading = false;
      }
    });
  }

  changeQuantity(item: InventoryItemDto, delta: number) {
    if (!item._id) return;
    const newQty = Math.max(0, (item.cantidad || 0) + delta);
    if (newQty === item.cantidad) return;
    const prev = item.cantidad;
    item.cantidad = newQty; // actualización optimista
    this.savingId = item._id;
    this.inventoryService.updateItem(item._id, { cantidad: newQty }).subscribe({
      next: () => { this.savingId = null; },
      error: () => { item.cantidad = prev; this.savingId = null; }
    });
  }

  addPedido() {
    this.orderForm = {
      articulo: '',
      proveedor: '',
      fecha: new Date().toISOString().slice(0,10),
      hora: new Date().toTimeString().slice(0,5),
      cantidad: 1,
      llegada: '',
      notas: '',
      fromItem: false
    };
    this.showOrderModal = true;
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }

  supplierFor(name?: string | null): SupplierDto | undefined {
    const n = (name || '').trim().toLowerCase();
    if (!n) return undefined;
    return this.suppliers.find(s => (s.nombre || '').trim().toLowerCase() === n);
  }

  openOrderModalFromItem(item: InventoryItemDto) {
    this.orderForm = {
      articulo: item.nombre,
      proveedor: item.proveedor || (this.supplierFor(item.proveedor)?.nombre || ''),
      fecha: new Date().toISOString().slice(0,10),
      hora: new Date().toTimeString().slice(0,5),
      cantidad: Math.max(item.stockMinimo - item.cantidad, 1),
      llegada: '',
      notas: '',
      fromItem: true
    };
    this.showOrderModal = true;
  }

  closeOrderModal() { this.showOrderModal = false; }

  saveOrder() {
    if (!this.projectId) { this.closeOrderModal(); return; }
    const payload: InventoryOrderDto = {
      projectId: this.projectId,
      itemNombre: this.orderForm.articulo,
      proveedor: this.orderForm.proveedor,
      fecha: this.orderForm.fecha,
      hora: this.orderForm.hora || new Date().toTimeString().slice(0,5),
      cantidad: Number(this.orderForm.cantidad) || 0,
      llegada: this.orderForm.llegada || '',
      notas: this.orderForm.notas || '',
      estado: 'pendiente'
    };
    this.ordersService.create(payload).subscribe({
      next: () => { this.closeOrderModal(); this.loadOrders(); },
      error: () => { this.closeOrderModal(); }
    });
  }

  openEstadoModal(o: InventoryOrderDto) {
    this.selectedEstadoOrder = o;
    this.selectedEstado = (o.estado || 'pendiente') as 'pendiente' | 'completado' | 'cancelado';
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
    this.selectedEstadoOrder.estado = this.selectedEstado as any; // Optimistic
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
}
