import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { ActivatedRoute } from '@angular/router';
import { ProjectContextService } from '../services/project-context.service';
import { FormsModule } from '@angular/forms';
import { ProjectService, ProjectDto } from '../services/project.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  projectId: string | null = null;
  showProfile: boolean = false;
  saving: boolean = false;
  loadError: string = '';
  projectForm: Partial<ProjectDto> = { name: '', sector: '', description: '', type: '', enabledTabs: [] };
  availableTabs: { key: string; label: string }[] = [
    { key: 'roadmap', label: 'Roadmap' },
    { key: 'tasks', label: 'Tareas' },
    { key: 'map', label: 'Mapa' },
    { key: 'events', label: 'Eventos' },
    { key: 'inventory', label: 'Inventario' },
    { key: 'suppliers', label: 'Proveedores' },
    { key: 'customers', label: 'Clientes' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'team', label: 'Equipo' },
    { key: 'invoices', label: 'Facturas' },
    { key: 'accounts', label: 'Cuentas' },
    { key: 'meetings', label: 'Reuniones' },
    { key: 'statistics', label: 'Estadísticas' }
  ];

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
      if (!this.projectForm.enabledTabs || this.projectForm.enabledTabs.length === 0) {
        this.projectForm.enabledTabs = this.availableTabs.map(t => t.key);
      }
    }
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
}


