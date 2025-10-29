import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AsistenteComponent } from './asistente/asistente.component';
import { ProfileComponent } from './profile/profile.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { CustomersComponent } from './customers/customers.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ProjectGuard } from './guards/project.guard';
import { SettingsComponent } from './settings/settings.component';
import { EventsComponent } from './events/events.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { TasksComponent } from './tasks/tasks.component';
import { MapComponent } from './map/map.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'signup', component: SignupComponent }, 
  { path: 'login', component: LoginComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, 
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'asistente', component: AsistenteComponent },
  { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard] },
  { path: 'suppliers', component: SuppliersComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: 'invoices', component: InvoicesComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'roadmap', component: RoadmapComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  // Contexto de proyecto
  { path: 'p/:projectId/inventory', component: InventoryComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/suppliers', component: SuppliersComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/customers', component: CustomersComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/invoices', component: InvoicesComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/statistics', component: StatisticsComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/settings', component: SettingsComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/events', component: EventsComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/roadmap', component: RoadmapComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/tasks', component: TasksComponent, canActivate: [AuthGuard, ProjectGuard] },
  { path: 'p/:projectId/map', component: MapComponent, canActivate: [AuthGuard, ProjectGuard] },
];
