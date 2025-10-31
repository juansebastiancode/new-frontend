import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { ActivatedRoute } from '@angular/router';
import { ProjectContextService } from '../services/project-context.service';
import { FormsModule } from '@angular/forms';
import { ProjectService, ProjectDto } from '../services/project.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  
  projectId: string | null = null;
  showProfile: boolean = false;
  saving: boolean = false;
  loadError: string = '';
  projectForm: Partial<ProjectDto> = { name: '', sector: '', description: '', type: '', enabledTabs: [] };
  private saveSubject = new Subject<void>();
  projectCreatedAt: string | undefined;
  availableTabs: { key: string; label: string }[] = [
    { key: 'roadmap', label: 'Roadmap' },
    { key: 'statistics', label: 'Estadísticas' },
    { key: 'map', label: 'Mapa' },
    { key: 'inventory', label: 'Inventario' },
    { key: 'suppliers', label: 'Proveedores' },
    { key: 'customers', label: 'Clientes' },
    { key: 'team', label: 'Equipo' },
    { key: 'tasks', label: 'Tareas' },
    { key: 'events', label: 'Eventos' },
    { key: 'meetings', label: 'Reuniones' },
    { key: 'credentials', label: 'Credenciales' },
    { key: 'technology', label: 'Tecnología' },
    { key: 'documents', label: 'Documentos' },
    { key: 'invoices', label: 'Facturas' },
    { key: 'financials', label: 'Movimientos' },
    { key: 'budgets', label: 'Presupuestos' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'rnd', label: 'I+D' }
  ];

  estrategiaTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['roadmap', 'statistics'].includes(t.key));
  operacionesTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['map', 'inventory', 'suppliers', 'customers'].includes(t.key));
  organizacionTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['team', 'tasks', 'events', 'meetings'].includes(t.key));
  recursosTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['credentials', 'technology', 'documents'].includes(t.key));
  finanzasTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['invoices', 'financials', 'budgets'].includes(t.key));
  crecimientoTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['marketing', 'rnd'].includes(t.key));
  showDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    public projectCtx: ProjectContextService,
    private projectService: ProjectService
  ) {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    const current = this.projectCtx.getCurrent();
    if (!this.projectId && (current as any)?._id) {
      this.projectId = (current as any)._id;
    }
    if (current) {
      this.projectForm = {
        name: current.name,
        sector: current.sector,
        description: (current as any).description || '',
        type: (current as any).type || '',
        enabledTabs: (current as any).enabledTabs || []
      };
      this.projectCreatedAt = (current as any).createdAt;
      if (!this.projectForm.enabledTabs || this.projectForm.enabledTabs.length === 0) {
        this.projectForm.enabledTabs = this.availableTabs.map(t => t.key);
      }
    }
  }

  ngOnInit() {
    this.saveSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.save();
    });
  }

  ngOnDestroy() {
    this.saveSubject.complete();
  }

  onFormChange() {
    this.saveSubject.next();
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getTabIcon(tabKey: string): string {
    const iconMap: { [key: string]: string } = {
      'roadmap': 'far fa-flag',
      'statistics': 'far fa-chart-bar',
      'map': 'far fa-map',
      'inventory': 'far fa-clipboard',
      'suppliers': 'far fa-address-book',
      'customers': 'far fa-user',
      'team': 'far fa-user-circle',
      'tasks': 'far fa-square-check',
      'events': 'far fa-calendar',
      'meetings': 'far fa-calendar-check',
      'credentials': 'far fa-id-card',
      'technology': 'fas fa-star',
      'documents': 'far fa-file',
      'invoices': 'far fa-file-lines',
      'financials': 'fas fa-dollar-sign',
      'budgets': 'far fa-file-lines',
      'marketing': 'fas fa-star',
      'rnd': 'far fa-lightbulb'
    };
    return iconMap[tabKey] || '';
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }

  toggleTab(tabKey: string, event: Event) {
    const target = event.target as HTMLInputElement;

    if (!this.projectForm.enabledTabs) {
      this.projectForm.enabledTabs = [];
    }

    const currentTabs = new Set(this.projectForm.enabledTabs);
    if (target.checked) {
      currentTabs.add(tabKey);
    } else {
      currentTabs.delete(tabKey);
    }
    const newEnabledTabs = Array.from(currentTabs);
    this.projectForm.enabledTabs = newEnabledTabs;

    // Reflejar de inmediato en el menú
    const current = this.projectCtx.getCurrent();
    if (current) {
      this.projectCtx.setProject({ ...(current as any), enabledTabs: newEnabledTabs } as any);
    }

    // Guardar fallback global para cuando no haya proyecto seleccionado
    try { localStorage.setItem('enabledTabsDefault', JSON.stringify(newEnabledTabs)); } catch {}

    // Guardar en BBDD
    if (!this.projectId) {
      this.loadError = 'Abre Ajustes desde un proyecto para guardar los cambios.';
      return;
    }

    this.projectService.updateProject(this.projectId, { enabledTabs: newEnabledTabs }).subscribe({
      next: (proj) => {
        // Asegurar sincronización final
        this.projectCtx.setProject(proj);
        try { localStorage.setItem('enabledTabsDefault', JSON.stringify(proj.enabledTabs || [])); } catch {}
      },
      error: (err) => {
        console.error(err);
        this.loadError = 'No se pudo guardar la visibilidad de tabs';
      }
    });
  }

  async save() {
    if (!this.projectId) {
      this.loadError = 'Abre Ajustes desde un proyecto para guardar los cambios.';
      return;
    }
    this.saving = true;
    this.loadError = '';
    this.projectService.updateProject(this.projectId, this.projectForm).subscribe({
      next: (proj) => {
        // Actualizar contexto local
        this.projectCtx.setProject(proj);
        try { localStorage.setItem('enabledTabsDefault', JSON.stringify(proj.enabledTabs || [])); } catch {}
        this.saving = false;
      },
      error: (err) => {
        this.saving = false;
        this.loadError = 'No se pudo guardar los cambios';
        console.error(err);
      }
    });
  }

  async deleteProject() {
    if (!this.projectId) return;
    this.saving = true;
    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => {
        this.saving = false;
        this.showDeleteModal = false;
        this.projectCtx.clear();
        window.location.href = '/dashboard';
      },
      error: (err) => {
        this.saving = false;
        this.showDeleteModal = false;
        // Si es 404 (not found), redirigir: como si ya se eliminó
        if (err.status === 404) {
          this.projectCtx.clear();
          window.location.href = '/dashboard';
        } else {
          this.loadError = 'No se pudo eliminar el proyecto';
          console.error(err);
        }
      }
    });
  }
}


