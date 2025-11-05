import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { ActivatedRoute } from '@angular/router';
import { ProjectContextService } from '../services/project-context.service';
import { FormsModule } from '@angular/forms';
import { ProjectService, ProjectDto } from '../services/project.service';
import { InvitationsService } from '../services/invitations.service';
import { AuthService } from '../services/auth.service';
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
    { key: 'customers', label: 'Clientes' },
    { key: 'orders', label: 'Pedidos' },
    { key: 'tasks', label: 'Tareas' },
    { key: 'events', label: 'Eventos' },
    { key: 'meetings', label: 'Reuniones' },
    { key: 'credentials', label: 'Credenciales' },
    { key: 'technology', label: 'Tecnología' },
    { key: 'assistant', label: 'Asistente' },
    { key: 'documents', label: 'Documentos' },
    { key: 'invoices', label: 'Facturas' },
    { key: 'financials', label: 'Movimientos' },
    { key: 'budgets', label: 'Presupuestos' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'rnd', label: 'I+D' },
    { key: 'legal', label: 'Legal' }
  ];

  estrategiaTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['roadmap', 'statistics'].includes(t.key));
  operacionesTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['map', 'inventory', 'customers', 'orders'].includes(t.key));
  organizacionTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['tasks', 'events', 'meetings'].includes(t.key));
  recursosTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['credentials', 'technology', 'assistant', 'documents', 'legal'].includes(t.key));
  finanzasTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['invoices', 'financials', 'budgets'].includes(t.key));
  crecimientoTabs: { key: string; label: string }[] = this.availableTabs.filter(t => ['marketing', 'rnd'].includes(t.key));
  showDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    public projectCtx: ProjectContextService,
    private projectService: ProjectService,
    private invitationsService: InvitationsService,
    private auth: AuthService
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
    // Cargar participantes del proyecto
    const proj = this.projectCtx.getCurrent();
    const projId = this.projectId || (proj as any)?._id;
    if (projId) {
      this.loadMembers(projId);
    }
  }

  ngOnDestroy() {
    this.saveSubject.complete();
  }

  // Participantes
  members: any[] = [];
  loadingMembers: boolean = false;
  membersError: string = '';
  pendingInvitations: any[] = [];
  loadingInvites: boolean = false;
  searchParticipants: string = '';
  // Invite modal
  showInviteModal: boolean = false;
  inviteEmail: string = '';
  inviteError: string = '';
  loadingInvite: boolean = false;
  openDropdownEmail: string | null = null;

  loadMembers(projectId: string) {
    this.loadingMembers = true;
    this.membersError = '';
    this.invitationsService.getProjectMembers(projectId).subscribe({
      next: (members) => {
        this.members = members || [];
        this.loadingMembers = false;
      },
      error: () => {
        this.loadingMembers = false;
        this.membersError = 'No se pudieron cargar los participantes';
      }
    });
    // Cargar invitaciones pendientes
    this.loadingInvites = true;
    this.invitationsService.getInvitationsByProject(projectId).subscribe({
      next: (resp: any) => {
        const invitations = Array.isArray(resp) ? resp : (resp?.invitations || []);
        this.pendingInvitations = invitations.filter((i: any) => i.status === 'pending');
        this.loadingInvites = false;
      },
      error: () => { this.loadingInvites = false; }
    });
  }

  get filteredParticipants(): any[] {
    const q = (this.searchParticipants || '').trim().toLowerCase();
    const normalizedMembers = this.members.map(m => ({
      nombre: m.nombre,
      email: m.email,
      isOwner: !!m.isOwner,
      invited: false,
      allowedTabs: m.allowedTabs || []
    }));
    const normalizedInvites = this.pendingInvitations.map((i: any) => ({
      nombre: i.inviteeEmail?.split('@')[0] || 'Usuario',
      email: i.inviteeEmail,
      isOwner: false,
      invited: true
    }));
    const all = [...normalizedMembers, ...normalizedInvites];
    if (!q) return all;
    return all.filter((p: any) =>
      (p.nombre || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q)
    );
  }


  toggleParticipantDropdown(member: any, event: Event) {
    event.stopPropagation();
    const email = member?.email;
    this.openDropdownEmail = this.openDropdownEmail === email ? null : email;
  }

  @HostListener('document:click')
  onDocClick() {
    this.openDropdownEmail = null;
  }

  openInviteModal() {
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.inviteError = '';
  }

  closeInviteModal() {
    this.showInviteModal = false;
    this.inviteEmail = '';
    this.inviteError = '';
  }

  sendInvitation() {
    const projectId = this.projectId || (this.projectCtx.getCurrent() as any)?._id;
    const inviterEmail = this.auth.getCurrentUser()?.email || '';
    if (!this.inviteEmail || !projectId || !inviterEmail) {
      this.inviteError = 'Email requerido';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.inviteEmail)) {
      this.inviteError = 'Email no válido';
      return;
    }
    this.loadingInvite = true;
    this.invitationsService.createInvitation({ projectId, inviterEmail, inviteeEmail: this.inviteEmail }).subscribe({
      next: () => {
        this.loadingInvite = false;
        this.closeInviteModal();
        this.loadMembers(projectId);
      },
      error: (e) => {
        this.loadingInvite = false;
        this.inviteError = e?.error?.error || 'Error al enviar la invitación';
      }
    });
  }

  // Gestión de permisos
  showPermsModal: boolean = false;
  permsMember: any = null;
  permsAllowedTabs: string[] = [];
  openPerms(member: any) {
    this.permsMember = member;
    this.permsAllowedTabs = Array.isArray(member.allowedTabs) ? [...member.allowedTabs] : [];
    this.showPermsModal = true;
  }
  closePermsModal() { this.showPermsModal = false; this.permsMember = null; }
  togglePerm(tabKey: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const current = new Set(this.permsAllowedTabs);
    if (input.checked) current.add(tabKey); else current.delete(tabKey);
    this.permsAllowedTabs = Array.from(current);
    // Guardar inmediatamente
    const projectId = this.projectId || (this.projectCtx.getCurrent() as any)?._id;
    if (!projectId || !this.permsMember?.email) return;
    this.invitationsService.updateMemberPermissions(projectId, this.permsMember.email, this.permsAllowedTabs).subscribe({
      next: () => {
        this.members = this.members.map(m => m.email === this.permsMember.email ? { ...m, allowedTabs: [...this.permsAllowedTabs] } : m);
      }
    });
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
      'roadmap': 'fas fa-flag',
      'statistics': 'fas fa-chart-bar',
      'map': 'fas fa-map',
      'inventory': 'fas fa-clipboard',
      'customers': 'fas fa-user',
      'orders': 'fas fa-box',
      'tasks': 'fas fa-square-check',
      'events': 'fas fa-calendar',
      'meetings': 'fas fa-calendar-check',
      'credentials': 'fas fa-id-card',
      'technology': 'fas fa-laptop',
      'assistant': 'fas fa-robot',
      'documents': 'fas fa-file',
      'invoices': 'fas fa-file-lines',
      'financials': 'fas fa-dollar',
      'budgets': 'fas fa-file-lines',
      'marketing': 'fas fa-star',
      'rnd': 'fas fa-lightbulb',
      'legal': 'fas fa-gavel'
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

  removeMember(member: any) {
    if (!this.projectId || !member.email) return;

    if (!confirm(`¿Seguro que quieres expulsar a ${member.nombre || member.email} del proyecto?`)) {
      return;
    }

    this.invitationsService.removeMember(this.projectId, member.email).subscribe({
      next: () => {
        console.log('Miembro expulsado');
        if (this.projectId) {
          this.loadMembers(this.projectId); // Recargar la lista de participantes
        }
      },
      error: (err) => {
        console.error('Error expulsando miembro:', err);
        alert('Error al expulsar al miembro');
      }
    });
  }
}


