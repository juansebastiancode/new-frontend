import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomepageComponent } from './homepage/homepage.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { LocationsComponent } from './locations/locations.component';
import { ProfileComponent } from './profile/profile.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { SendLocationComponent } from './send-location/send-location.component';
import { EventsComponent } from './events/events.component';
import { NewEventComponent } from './new-event/new-event.component';
import { ScannerComponent } from './scanner/scanner.component';
import { MyeventsComponent } from './myevents/myevents.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { AuthGuard } from './guards/auth.guard';
import { AsistenteComponent } from './asistente/asistente.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent }, 
  { path: 'homepage', component: HomepageComponent }, 
  { path: 'signup', component: SignupComponent }, 
  { path: 'login', component: LoginComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, 
  { path: 'locations', component: LocationsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'help', component: HelpPageComponent, canActivate: [AuthGuard] },
  { path: 'sendlocation', component: SendLocationComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'new-event', component: NewEventComponent, canActivate: [AuthGuard] },
  { path: 'scanner', component: ScannerComponent, canActivate: [AuthGuard] },
  { path: 'myevents', component: MyeventsComponent, canActivate: [AuthGuard] },
  { path: 'profile-settings', component: ProfileSettingsComponent, canActivate: [AuthGuard] },
  { path: 'asistente', component: AsistenteComponent },
];
