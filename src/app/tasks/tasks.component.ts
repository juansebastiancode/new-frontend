import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="tasks-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="tasks-container">
          <h2>Tareas</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'my'" (click)="select('my')">Mis tareas</button>
            <button class="tab" [class.active]="selected === 'board'" (click)="select('board')">Tablero</button>
            <button class="tab" [class.active]="selected === 'completed'" (click)="select('completed')">Completadas</button>
          </div>

          <div class="section" *ngIf="selected === 'my'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar mis tareas..." [(ngModel)]="searchMy" />
              </div>
              <button class="primary" (click)="addTask()">Nueva tarea</button>
            </div>
            <p class="muted">Tareas asignadas a ti.</p>
            <div class="card">No hay tareas asignadas.</div>
          </div>

          <div class="section" *ngIf="selected === 'board'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar en tablero..." [(ngModel)]="searchBoard" />
              </div>
              <button class="primary" (click)="addColumn()">Nueva columna</button>
            </div>
            <p class="muted">Organiza tareas por columnas (ToDo, En Proceso, Hecho...).</p>
            <div class="card">Tablero vacío.</div>
          </div>

          <div class="section" *ngIf="selected === 'completed'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar completadas..." [(ngModel)]="searchCompleted" />
              </div>
              <button class="primary" (click)="clearCompleted()">Limpiar completadas</button>
            </div>
            <p class="muted">Historial de tareas completadas.</p>
            <div class="card">Aún no hay tareas completadas.</div>
          </div>
        </div>
        <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
      </div>
    </div>
  `,
  styles: [`
    .tasks-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; }
    .tasks-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; }
    .muted { color: #555; font-size: 13px; margin: 0 0 8px 0; }

    .tabs { display: flex; gap: 8px; margin: 8px 0 24px 0; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
    .tab.active { background: #111; color: #fff; border-color: #111; }

    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 12px 0; }
    .search { min-width: 240px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; outline: none; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; background: #fff; }
    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class TasksComponent {
  showProfile: boolean = false;
  selected: 'my' | 'board' | 'completed' = 'my';
  searchMy: string = '';
  searchBoard: string = '';
  searchCompleted: string = '';

  select(section: 'my' | 'board' | 'completed') { this.selected = section; }

  addTask() { alert('Nueva tarea'); }
  addColumn() { alert('Nueva columna'); }
  clearCompleted() { alert('Limpiar completadas'); }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}


