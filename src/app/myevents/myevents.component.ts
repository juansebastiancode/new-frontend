import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-myevents',
  imports: [CommonModule],
  templateUrl: './myevents.component.html',
  styleUrl: './myevents.component.scss'
})
export class MyeventsComponent {

  constructor(private router: Router) {
    this.socket = io('http://localhost:3000');
  }
  
  socket: any;
  selected: string = 'total';
  
  navigate(page: string): void {
    const path = `/${page}`;
    this.router.navigate([path]);
  }

  user(): void {
    this.router.navigate(['/profile']);
  }


  query: string = '';
  results: any[] = [];
  errorMessage: string = '';

  searchSongs(query: string): void {
    this.query = query;
    if (!this.query || this.query.length < 1) {
      this.results = [];
      return;
    }

    fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(this.query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {

        if (response.ok) {
          return response.json();
        } else {
          console.error('Error en la búsqueda:', response.status);
          throw new Error('Error al buscar canciones');
        }
      })
      .then((data) => {
        console.log(data)
        this.results = data; // Asigna los resultados a la propiedad 'results'
        this.errorMessage = ''; // Limpiar cualquier mensaje de error
      })
      .catch((error) => {
        console.error('Error:', error);
        this.errorMessage = 'Ocurrió un error al buscar canciones.';
      });
  }

  getArtistsNames(artists: any[]): string {
    return artists.map(artist => artist.name).join(', ');
  }
  
  selectedTrackId: string | null = null;

  toggleSelection(trackId: string) {
    this.selectedTrackId = this.selectedTrackId === trackId ? null : trackId;
  }


  sendToDJ(track: any) {
    console.log("Enviado al DJ:", track.name);
    this.socket.emit('send-song-to-dj', track);
    alert(`Enviada 🎶`);
  }



  select(tipo: string) {
    this.selected = tipo;
  }

  

}
