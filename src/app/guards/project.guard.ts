import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ProjectContextService } from '../services/project-context.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ProjectService } from '../services/project.service';

export const ProjectGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const ctx = inject(ProjectContextService);
  const auth = inject(AuthService);
  const userService = inject(UserService);
  const projectService = inject(ProjectService);

  const projectId = route.params['projectId'];
  if (!projectId) {
    router.navigate(['/dashboard']);
    return false;
  }

  const currentUser = auth.getCurrentUser();
  const email = currentUser?.email;
  if (!email) {
    router.navigate(['/login']);
    return false;
  }

  return userService.getUserByEmail(email).pipe(
    switchMap((resp: any) => {
      const proyectos: Array<{ _id: string }> = resp?.user?.proyectos || [];
      const isMember = proyectos.some(p => String(p._id) === String(projectId));
      if (!isMember) {
        ctx.clear();
        router.navigate(['/dashboard']);
        return of(false);
      }
      // Intentar traer el proyecto completo (incluye enabledTabs)
      return projectService.getProjectById(projectId).pipe(
        map((project) => {
          if (project) {
            ctx.setProject(project);
          } else {
            ctx.setProject({ _id: projectId, userId: '', name: 'Project', sector: '', createdAt: '' } as any);
          }
          return true;
        }),
        catchError(() => {
          // Si falla la carga, al menos fijar contexto mínimo
          ctx.setProject({ _id: projectId, userId: '', name: 'Project', sector: '', createdAt: '' } as any);
          return of(true);
        })
      );
    }),
    catchError(() => {
      ctx.clear();
      router.navigate(['/dashboard']);
      return of(false);
    })
  );
};


