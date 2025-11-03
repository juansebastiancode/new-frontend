import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProjectContextService } from '../services/project-context.service';
import { AuthService } from '../services/auth.service';

// Mapeo de rutas a tabs
const routeToTabMap: { [key: string]: string } = {
  'inventory': 'inventory',
  'customers': 'customers',
  'marketing': 'marketing',
  'team': 'team',
  'invoices': 'invoices',
  'statistics': 'statistics',
  'settings': 'settings',
  'events': 'events',
  'roadmap': 'roadmap',
  'tasks': 'tasks',
  'map': 'map',
  'credentials': 'credentials',
  'meetings': 'meetings',
  'documents': 'documents',
  'technology': 'technology',
  'rnd': 'rnd',
  'financials': 'financials',
  'budgets': 'budgets',
  'legal': 'legal'
};

export const TabPermissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const ctx = inject(ProjectContextService);
  const auth = inject(AuthService);

  const currentProject = ctx.getCurrent();
  if (!currentProject) {
    // No hay proyecto, dejar que ProjectGuard maneje
    console.log('🔒 TabPermissionGuard: No hay proyecto, permitir');
    return true;
  }

  // Extraer el nombre del tab de la ruta
  const urlSegments = route.url.map(s => s.path);
  const lastSegment = urlSegments[urlSegments.length - 1];
  const tabKey = routeToTabMap[lastSegment];

  if (!tabKey) {
    // Tab no mapeado, permitir acceso (puede ser una subruta válida)
    console.log('🔒 TabPermissionGuard: Tab no mapeado, permitir');
    return true;
  }

  // Verificar si es el propietario del proyecto
  const mongoUserId = auth.getMongoUserId();
  const isProjectOwner = mongoUserId && currentProject.userId && String(currentProject.userId) === String(mongoUserId);
  console.log('🔒 TabPermissionGuard:', { 
    tabKey, 
    mongoUserId, 
    projectUserId: currentProject.userId, 
    projectUserIdString: String(currentProject.userId), 
    isProjectOwner 
  });

  // Si es propietario, tiene acceso a todo
  if (isProjectOwner) {
    console.log('🔒 TabPermissionGuard: Es propietario, permitir');
    return true;
  }

  // Si no tenemos mongoUserId todavía, permitir acceso (se validará en siguiente carga)
  if (!mongoUserId) {
    console.log('🔒 TabPermissionGuard: No hay mongoUserId, permitir');
    return true;
  }

  // Si es invitado, verificar permisos
  const allowedTabs = currentProject.allowedTabs;
  console.log('🔒 TabPermissionGuard: Invitado, allowedTabs:', allowedTabs);
  if (!allowedTabs || !Array.isArray(allowedTabs)) {
    // No hay permisos configurados, denegar acceso
    console.log('🔒 TabPermissionGuard: No hay permisos, DENEGAR');
    router.navigate(['/dashboard']);
    return false;
  }

  if (allowedTabs.includes(tabKey)) {
    console.log('🔒 TabPermissionGuard: Tiene permiso, permitir');
    return true;
  }

  // No tiene permiso para esta tab
  console.log('🔒 TabPermissionGuard: No tiene permiso, redirigiendo a primer tab permitido');
  const projectId = (route.params as any)['projectId'];
  const validTabsOrder = [
    'roadmap','statistics','map','inventory','customers','tasks','events','meetings','credentials','technology','documents','invoices','financials','budgets','marketing','rnd','legal','team','settings'
  ];
  const firstAllowed = allowedTabs.find((t: string) => validTabsOrder.includes(t));
  if (projectId && firstAllowed) {
    router.navigate(['/p', projectId, firstAllowed]);
  } else {
    router.navigate(['/dashboard']);
  }
  return false;
};

