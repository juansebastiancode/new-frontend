import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProjectDto } from './project.service';

const STORAGE_KEY = 'currentProject';

@Injectable({ providedIn: 'root' })
export class ProjectContextService {
  private subject = new BehaviorSubject<ProjectDto | null>(this.loadFromStorage());
  currentProject$ = this.subject.asObservable();

  getCurrent(): ProjectDto | null { return this.subject.value; }

  setProject(project: ProjectDto) {
    this.subject.next(project);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); } catch {}
  }

  clear() {
    this.subject.next(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  private loadFromStorage(): ProjectDto | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}


