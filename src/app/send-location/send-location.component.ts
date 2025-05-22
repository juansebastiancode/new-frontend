import { Component, ViewChild, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { io } from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MenubarComponent } from '../menubar/menubar.component';

@Component({
  selector: 'app-send-location',
  templateUrl: './send-location.component.html',
  styleUrl: './send-location.component.scss',
  imports: [CommonModule, MenubarComponent],
})
export class SendLocationComponent {
  
  query: string = '';
  results: any[] = [];
  errorMessage: string = '';

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

  socket: any;

  constructor(private router: Router) {
    this.socket = io('http://localhost:3000'); // URL de tu servidor Node
  }


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
}
