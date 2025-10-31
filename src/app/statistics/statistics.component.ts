import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { CustomersService } from '../services/customers.service';
import { SuppliersService } from '../services/suppliers.service';
import { UserService } from '../services/user.service';
import { ProjectContextService } from '../services/project-context.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="statistics-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="statistics-container">
          <h2>Estadísticas</h2>
          <p class="subtitle">Vista general de tu proyecto</p>

          <div class="stats-grid">
            <div class="stat-card clientes">
              <div class="stat-icon">
                <i class="far fa-user"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Clientes</div>
                <div class="stat-value">{{ stats.clientes }}</div>
              </div>
            </div>

            <div class="stat-card proveedores">
              <div class="stat-icon">
                <i class="far fa-address-book"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Proveedores</div>
                <div class="stat-value">{{ stats.proveedores }}</div>
              </div>
            </div>

            <div class="stat-card equipo">
              <div class="stat-icon">
                <i class="far fa-user-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Equipo</div>
                <div class="stat-value">{{ stats.equipo }}</div>
              </div>
            </div>

            <div class="stat-card tareas">
              <div class="stat-icon">
                <i class="far fa-square-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Tareas completadas</div>
                <div class="stat-value">{{ stats.tareasCompletadas }}</div>
              </div>
            </div>

            <div class="stat-card objetivos">
              <div class="stat-icon">
                <i class="far fa-flag"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Objetivos cumplidos</div>
                <div class="stat-value">{{ stats.objetivosCumplidos }}</div>
              </div>
            </div>

            <div class="stat-card facturas">
              <div class="stat-icon">
                <i class="far fa-file-lines"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Facturas</div>
                <div class="stat-value">{{ stats.facturas }}</div>
              </div>
            </div>

            <div class="stat-card tecnologia">
              <div class="stat-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Tecnologías</div>
                <div class="stat-value">{{ stats.tecnologia }}</div>
              </div>
            </div>
          </div>

          <div class="incomes-section">
            <div class="section-header">
              <h3>Ingresos por mes</h3>
              <span class="hint">Basado en datos del proyecto</span>
            </div>

            <div class="incomes-content">
              <div class="chart-wrap">
                <svg [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight" class="line-chart">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.35"/>
                      <stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path [attr.d]="areaPathIncome" fill="url(#areaGradient)" stroke="none"></path>
                  <path [attr.d]="linePathIncome" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
                  <path [attr.d]="linePathExpense" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
                  <g *ngFor="let p of incomePoints"><circle [attr.cx]="p.x" [attr.cy]="p.y" r="3.5" fill="#2563eb"></circle></g>
                  <g *ngFor="let p of expensePoints"><circle [attr.cx]="p.x" [attr.cy]="p.y" r="3.5" fill="#ef4444"></circle></g>
                  <!-- Leyenda -->
                  <g>
                    <rect x="16" y="12" width="10" height="10" fill="#2563eb" rx="2" ry="2"></rect>
                    <text x="32" y="21" font-size="12" fill="#374151">Ingresos</text>
                    <rect x="96" y="12" width="10" height="10" fill="#ef4444" rx="2" ry="2"></rect>
                    <text x="112" y="21" font-size="12" fill="#374151">Gastos</text>
                  </g>
                </svg>
              </div>
              <div class="table-wrap">
                <table class="incomes-table">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th class="amount">Ingresos (€)</th>
                      <th class="amount">Gastos (€)</th>
                      <th class="amount">Beneficio (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let row of incomes; let i = index">
                      <td>{{ row.month }}</td>
                      <td class="amount">{{ row.amount | number:'1.0-0' }}</td>
                      <td class="amount">{{ expenses[i]?.amount | number:'1.0-0' }}</td>
                      <td class="amount">{{ (row.amount - (expenses[i]?.amount || 0)) | number:'1.0-0' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td class="amount">{{ totalIncome | number:'1.0-0' }}</td>
                      <td class="amount">{{ totalExpense | number:'1.0-0' }}</td>
                      <td class="amount">{{ totalProfit | number:'1.0-0' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div class="rankings-section">
            <div class="section-header">
              <h3>Rankings</h3>
              <span class="hint">Top clientes y proveedores</span>
            </div>
            <div class="rankings-grid">
              <div class="ranking-card">
                <div class="ranking-title"><i class="far fa-user"></i> Clientes que más han pagado</div>
                <ul class="ranking-list">
                  <li class="ranking-item" *ngFor="let c of topClientes; let i = index">
                    <div class="pos">{{ i+1 }}</div>
                    <div class="avatar">{{ c.nombre.charAt(0) }}</div>
                    <div class="info">
                      <div class="name">{{ c.nombre }}</div>
                      <div class="muted">{{ c.ciudad || '—' }}</div>
                    </div>
                    <div class="metric">€ {{ c.total | number:'1.0-0' }}</div>
                  </li>
                </ul>
              </div>

              <div class="ranking-card">
                <div class="ranking-title"><i class="far fa-address-book"></i> Proveedores más frecuentes</div>
                <ul class="ranking-list">
                  <li class="ranking-item" *ngFor="let p of topProveedores; let i = index">
                    <div class="pos">{{ i+1 }}</div>
                    <div class="avatar alt">{{ p.nombre.charAt(0) }}</div>
                    <div class="info">
                      <div class="name">{{ p.nombre }}</div>
                      <div class="muted">{{ p.ciudad || '—' }}</div>
                    </div>
                    <div class="metric">{{ p.frecuencia }}×</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
    </div>
  `,
  styles: [`
    .statistics-page { width: 100%; height: 100vh; background: #f9fafb; position: relative; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    .main-content { margin-left: 250px; height: 100vh; background: #f9fafb; overflow-y: auto; }
    .statistics-container { padding: 32px; max-width: 1400px; margin: 0 auto; }
    h2 { margin: 0 0 4px 0; font-weight: 700; font-size: 32px; color: #111; }
    .subtitle { margin: 0 0 32px 0; color: #6b7280; font-size: 16px; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }

    .stat-card { background: #fff; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

    .stat-icon { width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon i { font-size: 28px; }

    .stat-card.clientes .stat-icon { background: #DBEAFE; color: #1E40AF; }
    .stat-card.proveedores .stat-icon { background: #FEF3C7; color: #92400E; }
    .stat-card.equipo .stat-icon { background: #D1FAE5; color: #065F46; }
    .stat-card.tareas .stat-icon { background: #E0E7FF; color: #3730A3; }
    .stat-card.objetivos .stat-icon { background: #FCE7F3; color: #9F1239; }
    .stat-card.facturas .stat-icon { background: #F3E8FF; color: #6B21A8; }
    .stat-card.tecnologia .stat-icon { background: #FED7AA; color: #9A3412; }

    .stat-content { flex: 1; min-width: 0; }
    .stat-label { color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .stat-value { color: #111; font-size: 36px; font-weight: 700; line-height: 1; }

    .incomes-section { margin-top: 32px; }
    .section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; }
    .section-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #111; }
    .section-header .hint { color: #6b7280; font-size: 12px; }
    .incomes-content { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
    .chart-wrap { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .line-chart { width: 100%; height: 260px; display: block; }
    .table-wrap { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: auto; }
    .incomes-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .incomes-table th, .incomes-table td { padding: 10px 8px; border-bottom: 1px solid #eee; text-align: left; }
    .incomes-table th.amount, .incomes-table td.amount { text-align: right; font-variant-numeric: tabular-nums; }
    .incomes-table tfoot td { font-weight: 700; }

    .rankings-section { margin-top: 24px; }
    .rankings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    .ranking-card { background:#fff; border-radius:16px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
    .ranking-title { font-weight:700; color:#111; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
    .ranking-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
    .ranking-item { display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #eee; border-radius:12px; }
    .pos { width:24px; height:24px; border-radius:6px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; font-size:12px; color:#6b7280; }
    .avatar { width:32px; height:32px; border-radius:50%; background:#DBEAFE; color:#1E40AF; display:flex; align-items:center; justify-content:center; font-weight:700; }
    .avatar.alt { background:#FEF3C7; color:#92400E; }
    .info { flex:1; min-width:0; }
    .info .name { font-weight:600; color:#111; }
    .info .muted { color:#6b7280; font-size:12px; }
    .metric { font-weight:700; color:#111; min-width:72px; text-align:right; }

    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
      .statistics-container { padding: 20px; }
      .stats-grid { grid-template-columns: 1fr; gap: 16px; }
      h2 { font-size: 24px; }
      .stat-value { font-size: 28px; }
      .incomes-content { grid-template-columns: 1fr; }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  showProfile: boolean = false;
  stats = {
    clientes: 0,
    proveedores: 0,
    equipo: 0,
    tareasCompletadas: 0,
    objetivosCumplidos: 0,
    facturas: 0,
    tecnologia: 0
  };
  loading = true;
  incomes: Array<{ month: string; amount: number }> = [
    { month: 'Ene', amount: 1200 },
    { month: 'Feb', amount: 1800 },
    { month: 'Mar', amount: 1500 },
    { month: 'Abr', amount: 2200 },
    { month: 'May', amount: 2600 },
    { month: 'Jun', amount: 2400 },
  ];
  expenses: Array<{ month: string; amount: number }> = [
    { month: 'Ene', amount: 900 },
    { month: 'Feb', amount: 1000 },
    { month: 'Mar', amount: 1300 },
    { month: 'Abr', amount: 1600 },
    { month: 'May', amount: 1900 },
    { month: 'Jun', amount: 1700 },
  ];
  totalIncome = 0;
  totalExpense = 0;
  totalProfit = 0;
  chartWidth = 600;
  chartHeight = 240;
  incomePoints: Array<{ x: number; y: number }> = [];
  expensePoints: Array<{ x: number; y: number }> = [];
  linePathIncome = '';
  linePathExpense = '';
  areaPathIncome = '';
  topClientes: Array<{ nombre: string; ciudad?: string; total: number }> = [
    { nombre: 'Acme Corp', ciudad: 'Madrid', total: 5400 },
    { nombre: 'Globex', ciudad: 'Valencia', total: 4200 },
    { nombre: 'Soylent', ciudad: 'Sevilla', total: 3100 },
  ];
  topProveedores: Array<{ nombre: string; ciudad?: string; frecuencia: number }> = [
    { nombre: 'SupplyCo', ciudad: 'Barcelona', frecuencia: 9 },
    { nombre: 'Distribuciones SA', ciudad: 'Bilbao', frecuencia: 7 },
    { nombre: 'LogiFast', ciudad: 'Madrid', frecuencia: 5 },
  ];

  constructor(
    private customersService: CustomersService,
    private suppliersService: SuppliersService,
    private userService: UserService,
    private projectCtx: ProjectContextService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.computeIncomeStats();
  }

  get projectId(): string | null {
    const currentProject = this.projectCtx.getCurrent();
    return (currentProject as any)?._id || null;
  }

  loadStats() {
    const projectId = this.projectId;
    if (!projectId) {
      console.warn('No hay proyecto seleccionado');
      this.loading = false;
      return;
    }

    // Cargar todas las estadísticas en paralelo
    forkJoin({
      clientes: this.customersService.getCustomers(projectId).pipe(catchError(() => of([]))),
      proveedores: this.suppliersService.getSuppliers(projectId).pipe(catchError(() => of([]))),
      usuarios: this.userService.getAllUsers().pipe(catchError(() => of({ users: [] })))
    }).subscribe({
      next: (results) => {
        this.stats.clientes = Array.isArray(results.clientes) ? results.clientes.length : 0;
        this.stats.proveedores = Array.isArray(results.proveedores) ? results.proveedores.length : 0;
        this.stats.equipo = results.usuarios?.users?.length || 0;
        
        // Para las estadísticas que aún no tienen backend, dejamos en 0
        // Se pueden implementar después cuando estén los servicios correspondientes
        this.stats.tareasCompletadas = 0; // TODO: implementar cuando haya servicio de tareas
        this.stats.objetivosCumplidos = 0; // TODO: implementar cuando haya servicio de objetivos
        this.stats.facturas = 0; // TODO: implementar cuando haya servicio de facturas
        this.stats.tecnologia = 0; // TODO: implementar cuando haya servicio de tecnología
        
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }

  private computeIncomeStats() {
    // Normalizar longitudes
    const len = Math.min(this.incomes.length, this.expenses.length);
    this.incomes = this.incomes.slice(0, len);
    this.expenses = this.expenses.slice(0, len);

    this.totalIncome = this.incomes.reduce((sum, r) => sum + r.amount, 0);
    this.totalExpense = this.expenses.reduce((sum, r) => sum + r.amount, 0);
    this.totalProfit = this.totalIncome - this.totalExpense;

    const padding = 28;
    const w = this.chartWidth - padding * 2;
    const h = this.chartHeight - padding * 2;
    const maxSeries = Math.max(
      ...this.incomes.map(r => r.amount),
      ...this.expenses.map(r => r.amount), 1
    );
    const stepX = w / Math.max(len - 1, 1);

    this.incomePoints = this.incomes.map((r, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - r.amount / maxSeries) * h;
      return { x, y };
    });
    this.expensePoints = this.expenses.map((r, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - r.amount / maxSeries) * h;
      return { x, y };
    });

    this.linePathIncome = this.incomePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    this.linePathExpense = this.expensePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    if (this.incomePoints.length > 1) {
      const first = this.incomePoints[0];
      const last = this.incomePoints[this.incomePoints.length - 1];
      this.areaPathIncome = `M ${first.x} ${this.incomePoints[0].y} ` +
        this.incomePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
        ` L ${last.x} ${padding + h} L ${first.x} ${padding + h} Z`;
    } else {
      this.areaPathIncome = '';
    }
  }
}
