import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  inicio: string;
  fin: string;
  location: string;
  imagen?: string;
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class EventsComponent implements OnInit {
  eventos: Evento[] = [];
  errorMessage: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarEventos();
  }

  async cargarEventos() {
    try {
      const response = await fetch('http://localhost:3000/api/');
      if (!response.ok) {
        throw new Error('Error al cargar los eventos');
      }
      this.eventos = await response.json();
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage = 'Error al cargar los eventos';
    }
  }

  formatearHora(timestamp: string): string {
    const fecha = new Date(timestamp);
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  formatearFecha(timestamp: string): string {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  crearEvento() {
    this.router.navigate(['/new-event']);
  }

  goBack() {
    this.router.navigate(['/events']);
  }
}
