import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AsistenteComponent } from './asistente/asistente.component';
import { ProfileComponent } from './profile/profile.component';
import { InventoryComponent } from './inventory/inventory.component';
import { CustomersComponent } from './customers/customers.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ProjectGuard } from './guards/project.guard';
import { TabPermissionGuard } from './guards/tab-permission.guard';
import { SettingsComponent } from './settings/settings.component';
import { EventsComponent } from './events/events.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { TasksComponent } from './tasks/tasks.component';
import { MapComponent } from './map/map.component';
import { MarketingComponent } from './marketing/marketing.component';
import { TeamComponent } from './team/team.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { DocumentsComponent } from './documents/documents.component';
import { TechnologyComponent } from './technology/technology.component';
import { RndComponent } from './rnd/rnd.component';
import { AccountsComponent } from './accounts/accounts.component';
import { BudgetsComponent } from './budgets/budgets.component';
import { LegalComponent } from './legal/legal.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'signup', component: SignupComponent }, 
  { path: 'login', component: LoginComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, 
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'asistente', component: AsistenteComponent },
  { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: 'marketing', component: MarketingComponent, canActivate: [AuthGuard] },
  { path: 'team', component: TeamComponent, canActivate: [AuthGuard] },
  { path: 'invoices', component: InvoicesComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'roadmap', component: RoadmapComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'credentials', component: CredentialsComponent, canActivate: [AuthGuard] },
  { path: 'meetings', component: MeetingsComponent, canActivate: [AuthGuard] },
  { path: 'documents', component: DocumentsComponent, canActivate: [AuthGuard] },
  { path: 'technology', component: TechnologyComponent, canActivate: [AuthGuard] },
  { path: 'rnd', component: RndComponent, canActivate: [AuthGuard] },
  { path: 'financials', component: AccountsComponent, canActivate: [AuthGuard] },
  { path: 'budgets', component: BudgetsComponent, canActivate: [AuthGuard] },
  { path: 'legal', component: LegalComponent, canActivate: [AuthGuard] },
  // Contexto de proyecto
  { path: 'p/:projectId/inventory', component: InventoryComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/customers', component: CustomersComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/marketing', component: MarketingComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/team', component: TeamComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/invoices', component: InvoicesComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/statistics', component: StatisticsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/settings', component: SettingsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/events', component: EventsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/roadmap', component: RoadmapComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/tasks', component: TasksComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/map', component: MapComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/credentials', component: CredentialsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/meetings', component: MeetingsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/documents', component: DocumentsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/technology', component: TechnologyComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/rnd', component: RndComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/financials', component: AccountsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/budgets', component: BudgetsComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
  { path: 'p/:projectId/legal', component: LegalComponent, canActivate: [AuthGuard, ProjectGuard, TabPermissionGuard] },
];
