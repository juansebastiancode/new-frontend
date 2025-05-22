import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { io } from 'socket.io-client';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {
  private map!: L.Map;
  private socket: any;
  private markersLayer!: L.LayerGroup; // Grupo de capas para gestionar los marcadores

  constructor(private router: Router) {}

  ngOnInit(): void {

  }

  navigate(page: string): void {
    const path = `/${page}`;
    this.router.navigate([path]);
  }

  logOut(): void {
    this.router.navigate(['/homepage']);
  }

}
