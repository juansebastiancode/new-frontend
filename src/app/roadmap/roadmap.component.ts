import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <div class="roadmap-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="roadmap-container">
          <h2>Roadmap Estratégico</h2>

          <div class="tabs">
            <button class="tab" [class.active]="selected === 'vision'" (click)="select('vision')">Visión & Misión</button>
            <button class="tab" [class.active]="selected === 'swot'" (click)="select('swot')">DAFO</button>
            <button class="tab" [class.active]="selected === 'goals'" (click)="select('goals')">Objetivos</button>
            <button class="tab" [class.active]="selected === 'kpis'" (click)="select('kpis')">KPIs</button>
            <button class="tab" [class.active]="selected === 'timeline'" (click)="select('timeline')">Cronograma</button>
          </div>

          <div class="section" *ngIf="selected === 'vision'">
            <div class="vision-field">
              <h3><i class="fas fa-bullseye"></i> Meta Final</h3>
              <textarea class="vision-text" [(ngModel)]="visionData.finalGoal" placeholder="¿Cuál es tu meta final? ¿Qué quieres lograr con este proyecto?"></textarea>
            </div>
            
            <div class="vision-field">
              <h3><i class="fas fa-lightbulb"></i> Filosofía</h3>
              <textarea class="vision-text" [(ngModel)]="visionData.philosophy" placeholder="¿Cuáles son tus valores? ¿Cómo quieres trabajar?"></textarea>
            </div>
            
            <div class="vision-field">
              <h3><i class="fas fa-rocket"></i> Motivación</h3>
              <textarea class="vision-text" [(ngModel)]="visionData.motivation" placeholder="¿Por qué haces esto? ¿Qué te impulsa cada día?"></textarea>
            </div>
            
            <div class="vision-field">
              <h3><i class="fas fa-heart"></i> Valores</h3>
              <textarea class="vision-text" [(ngModel)]="visionData.values" placeholder="¿Cuáles son los valores fundamentales de tu empresa? ¿En qué crees?"></textarea>
            </div>
            
            <button class="primary" (click)="saveVision()">Guardar Visión</button>
          </div>

          <div class="section" *ngIf="selected === 'swot'">
            <div class="swot-grid">
              <div class="swot-quadrant">
                <h3><i class="fas fa-thumbs-up"></i> Fortalezas</h3>
                <textarea class="swot-text" [(ngModel)]="swotData.strengths" placeholder="¿Qué haces mejor que la competencia? ¿Cuáles son tus ventajas?"></textarea>
              </div>
              
              <div class="swot-quadrant">
                <h3><i class="fas fa-thumbs-down"></i> Debilidades</h3>
                <textarea class="swot-text" [(ngModel)]="swotData.weaknesses" placeholder="¿En qué áreas necesitas mejorar? ¿Qué limitaciones tienes?"></textarea>
              </div>
              
              <div class="swot-quadrant">
                <h3><i class="fas fa-star"></i> Oportunidades</h3>
                <textarea class="swot-text" [(ngModel)]="swotData.opportunities" placeholder="¿Qué oportunidades de mercado ves? ¿Qué tendencias puedes aprovechar?"></textarea>
              </div>
              
              <div class="swot-quadrant">
                <h3><i class="fas fa-exclamation-triangle"></i> Amenazas</h3>
                <textarea class="swot-text" [(ngModel)]="swotData.threats" placeholder="¿Qué riesgos enfrentas? ¿Qué amenazas externas hay?"></textarea>
              </div>
            </div>
            
            <button class="primary" (click)="saveSwot()">Guardar DAFO</button>
          </div>

          <div class="section" *ngIf="selected === 'goals'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar objetivos..." [(ngModel)]="searchGoals" />
              </div>
              <button class="primary" (click)="addGoal()">Nuevo objetivo</button>
            </div>
            <p class="muted">Define objetivos claros y medibles para tu proyecto.</p>
            <div class="goals-grid">
              <div class="goal-card" *ngFor="let goal of goals">
                <h4>{{ goal.title }}</h4>
                <p>{{ goal.description }}</p>
                <div class="goal-meta">
                  <span class="priority" [class]="'priority-' + goal.priority">{{ goal.priority }}</span>
                  <span class="deadline">{{ goal.deadline }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'kpis'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar KPIs..." [(ngModel)]="searchKpis" />
              </div>
              <button class="primary" (click)="addKpi()">Nuevo KPI</button>
            </div>
            <p class="muted">Métricas clave para medir el éxito de tu proyecto.</p>
            <div class="kpis-grid">
              <div class="kpi-card" *ngFor="let kpi of kpis">
                <div class="kpi-header">
                  <h4>{{ kpi.name }}</h4>
                  <span class="kpi-value">{{ kpi.currentValue }}/{{ kpi.targetValue }}</span>
                </div>
                <div class="kpi-progress">
                  <div class="progress-bar" [style.width.%]="(kpi.currentValue / kpi.targetValue) * 100"></div>
                </div>
                <p class="kpi-description">{{ kpi.description }}</p>
              </div>
            </div>
          </div>

          <div class="section" *ngIf="selected === 'timeline'">
            <div class="actions">
              <div class="search-wrap">
                <input class="search" type="text" placeholder="Buscar hitos..." [(ngModel)]="searchMilestones" />
              </div>
              <button class="primary" (click)="addMilestone()">Nuevo hito</button>
            </div>
            <p class="muted">Cronograma de hitos importantes hacia tu meta final.</p>
            <div class="timeline">
              <div class="milestone" *ngFor="let milestone of milestones">
                <div class="milestone-date">{{ milestone.date }}</div>
                <div class="milestone-content">
                  <h4>{{ milestone.title }}</h4>
                  <p>{{ milestone.description }}</p>
                  <span class="milestone-status" [class]="'status-' + milestone.status">{{ milestone.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>
      </div>
    </div>
  `,
  styles: [`
    .roadmap-page { width: 100%; height: 100vh; background: white; position: relative; }
    .main-content { margin-left: 250px; height: 100vh; background: white; overflow: auto; }
    .roadmap-container { padding: 24px; }
    h2 { margin: 0 0 12px 0; font-weight: 600; }
    .muted { color: #555; font-size: 13px; margin: 0 0 8px 0; }

    .tabs { display: flex; gap: 8px; margin: 8px 0 24px 0; }
    .tab { border: 1px solid #ddd; background: #fff; color: #111; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
    .tab.active { background: #111; color: #fff; border-color: #111; }

    .actions { display: flex; gap: 10px; align-items: center; margin: 16px 0 12px 0; }
    .search { min-width: 240px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; outline: none; }
    .primary { background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    .primary:hover { opacity: .92; }

    .vision-field { margin-bottom: 24px; }
    .vision-field h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .vision-field h3 i { color: #111; font-size: 14px; }
    .vision-text { width: 70%; max-width: 600px; min-height: 130px; border: none; border-radius: 8px; padding: 12px; font-size: 14px; resize: none; outline: none; background: transparent; box-shadow: none; }

    .swot-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 12px; 
      margin-bottom: 24px;
      max-width: 900px;
    }
    .swot-quadrant { 
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
      min-height: 280px;
    }
    .swot-quadrant:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .swot-quadrant:first-child { border-color: #10b981; }
    .swot-quadrant:first-child:hover { border-color: #059669; box-shadow: 0 8px 24px rgba(16,185,129,0.2); }
    .swot-quadrant:nth-child(2) { border-color: #ef4444; }
    .swot-quadrant:nth-child(2):hover { border-color: #dc2626; box-shadow: 0 8px 24px rgba(239,68,68,0.2); }
    .swot-quadrant:nth-child(3) { border-color: #3b82f6; }
    .swot-quadrant:nth-child(3):hover { border-color: #2563eb; box-shadow: 0 8px 24px rgba(59,130,246,0.2); }
    .swot-quadrant:nth-child(4) { border-color: #f59e0b; }
    .swot-quadrant:nth-child(4):hover { border-color: #d97706; box-shadow: 0 8px 24px rgba(245,158,11,0.2); }
    .swot-quadrant h3 { 
      margin: 0 0 16px 0; 
      font-size: 18px; 
      font-weight: 700; 
      display: flex; 
      align-items: center; 
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f3f4f6;
    }
    .swot-quadrant:first-child h3 { color: #059669; border-bottom-color: #d1fae5; }
    .swot-quadrant:nth-child(2) h3 { color: #dc2626; border-bottom-color: #fee2e2; }
    .swot-quadrant:nth-child(3) h3 { color: #2563eb; border-bottom-color: #dbeafe; }
    .swot-quadrant:nth-child(4) h3 { color: #d97706; border-bottom-color: #fef3c7; }
    .swot-quadrant h3 i { font-size: 18px; }
    .swot-text { 
      width: 100%; 
      height: 180px; 
      border: none;
      border-radius: 8px; 
      padding: 14px; 
      font-size: 14px; 
      resize: none; 
      outline: none;
      background: transparent;
      flex: 1;
      font-family: inherit;
      transition: background .2s ease;
      box-sizing: border-box;
    }
    .swot-text:focus {
      background: rgba(255,255,255,0.5);
      outline: none;
      box-shadow: none;
    }
    @media (max-width: 768px) { .swot-grid { grid-template-columns: 1fr; max-width: 100%; } }

    .goals-grid, .kpis-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
    .goal-card, .kpi-card { background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 16px; }
    .goal-card h4, .kpi-card h4 { margin: 0 0 8px 0; font-size: 14px; font-weight: 600; }
    .goal-meta { display: flex; gap: 8px; margin-top: 8px; }
    .priority { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .priority-alta { background: #fee2e2; color: #dc2626; }
    .priority-media { background: #fef3c7; color: #d97706; }
    .priority-baja { background: #d1fae5; color: #059669; }
    .deadline { font-size: 12px; color: #666; }

    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .kpi-value { font-weight: 600; color: #111; }
    .kpi-progress { background: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
    .progress-bar { background: #111; height: 100%; transition: width 0.3s ease; }
    .kpi-description { font-size: 12px; color: #666; margin: 0; }

    .timeline { position: relative; padding-left: 20px; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #ddd; }
    .milestone { position: relative; margin-bottom: 24px; padding-left: 20px; }
    .milestone::before { content: ''; position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; background: #111; border-radius: 50%; }
    .milestone-date { font-size: 12px; color: #666; margin-bottom: 4px; }
    .milestone-content h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; }
    .milestone-content p { margin: 0 0 8px 0; font-size: 13px; color: #666; }
    .milestone-status { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .status-pendiente { background: #fef3c7; color: #d97706; }
    .status-en-progreso { background: #dbeafe; color: #2563eb; }
    .status-completado { background: #d1fae5; color: #059669; }

    @media (max-width: 768px) { .main-content { margin-left: 200px; } }
  `]
})
export class RoadmapComponent {
  showProfile: boolean = false;
  selected: 'vision' | 'swot' | 'goals' | 'kpis' | 'timeline' = 'vision';
  searchGoals: string = '';
  searchKpis: string = '';
  searchMilestones: string = '';

  visionData = {
    finalGoal: '',
    philosophy: '',
    motivation: '',
    values: ''
  };

  swotData = {
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: ''
  };

  goals = [
    { title: 'Lanzar MVP', description: 'Desarrollar y lanzar la primera versión del producto', priority: 'alta', deadline: 'Q1 2024' },
    { title: 'Conseguir 100 usuarios', description: 'Alcanzar los primeros 100 usuarios activos', priority: 'media', deadline: 'Q2 2024' }
  ];

  kpis = [
    { name: 'Usuarios activos', currentValue: 25, targetValue: 100, description: 'Usuarios que usan el producto mensualmente' },
    { name: 'Ingresos mensuales', currentValue: 500, targetValue: 5000, description: 'Revenue recurrente mensual' },
    { name: 'Satisfacción cliente', currentValue: 4.2, targetValue: 4.5, description: 'Puntuación promedio de satisfacción' }
  ];

  milestones = [
    { date: 'Enero 2024', title: 'Desarrollo MVP', description: 'Completar funcionalidades básicas', status: 'completado' },
    { date: 'Marzo 2024', title: 'Lanzamiento beta', description: 'Lanzar versión beta con usuarios selectos', status: 'en-progreso' },
    { date: 'Junio 2024', title: 'Lanzamiento oficial', description: 'Lanzamiento público del producto', status: 'pendiente' }
  ];

  select(section: 'vision' | 'swot' | 'goals' | 'kpis' | 'timeline') { this.selected = section; }

  saveVision() { alert('Visión guardada'); }
  saveSwot() { alert('DAFO guardado'); }
  addGoal() { alert('Nuevo objetivo'); }
  addKpi() { alert('Nuevo KPI'); }
  addMilestone() { alert('Nuevo hito'); }

  toggleProfile() { this.showProfile = !this.showProfile; }
  closeProfile() { this.showProfile = false; }
}


