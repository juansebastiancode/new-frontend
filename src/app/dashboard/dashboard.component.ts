import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  public socket!: Socket;
  public receivedSongs: any[] = [];
  public sidebarActive = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO');
    });

    this.socket.on('new-song-for-dj', (track: any) => {
      console.log('🎶 Canción recibida:', track);
      this.receivedSongs.push(track);
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getArtistNames(artists: any[]): string {
    return artists.map(a => a.name).join(', ');
  }
  
  logOut(): void { 
    //se tendrá que gestar aqui el cierre del usuario
    this.router.navigate(["/homepage"]);
  }

  refreshPage(): void {
    window.location.reload();
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.sidebarActive = false;
  }
}
