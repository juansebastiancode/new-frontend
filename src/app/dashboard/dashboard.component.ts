import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MenubarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  // Dashboard con menubar existente
}