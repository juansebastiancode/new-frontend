import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenubarComponent } from '../menubar/menubar.component';

interface Evento {
  nombre: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
}

@Component({
  selector: 'app-new-event',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent],
  templateUrl: './new-event.component.html',
  styleUrl: './new-event.component.scss'
})
export class NewEventComponent {
  constructor(private router: Router) {}

  evento: Evento = {
    nombre: '',
    descripcion: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    lugar: ''
  };

  errorMessage: string = '';

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  async crearEvento() {
    if (this.validarFormulario()) {
      const eventData = {
        nombre: this.evento.nombre,
        descripcion: this.evento.descripcion,
        fecha: this.evento.fecha,
        inicio: this.evento.horaInicio,
        fin: this.evento.horaFin,
        location: this.evento.lugar
      };

      try {
        const response = await fetch('http://localhost:3000/api/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });

        if (!response.ok) {
          throw new Error('Error al crear el evento');
        }

        const data = await response.json();
        console.log('Evento creado:', data);
        this.errorMessage = 'Evento creado exitosamente!';
        
        // Limpiar el formulario
        this.evento = {
          nombre: '',
          descripcion: '',
          fecha: '',
          horaInicio: '',
          horaFin: '',
          lugar: ''
        };

        // Redirigir a la página de eventos después de 1 segundo
        setTimeout(() => {
          this.router.navigate(['/events']);
        }, 1000);

      } catch (error) {
        console.error('Error creando el evento:', error);
        this.errorMessage = 'Error al crear el evento. Por favor, inténtalo de nuevo.';
      }
    }
  }

  validarFormulario(): boolean {
    if (!this.evento.nombre) {
      this.errorMessage = 'El nombre del evento es requerido';
      return false;
    }
    if (!this.evento.fecha) {
      this.errorMessage = 'La fecha es requerida';
      return false;
    }
    if (!this.evento.horaInicio) {
      this.errorMessage = 'La hora de inicio es requerida';
      return false;
    }
    if (!this.evento.horaFin) {
      this.errorMessage = 'La hora de finalización es requerida';
      return false;
    }
    if (!this.evento.lugar) {
      this.errorMessage = 'El lugar es requerido';
      return false;
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    if (this.evento.horaInicio >= this.evento.horaFin) {
      this.errorMessage = 'La hora de finalización debe ser posterior a la hora de inicio';
      return false;
    }

    this.errorMessage = '';
    return true;
  }
}
