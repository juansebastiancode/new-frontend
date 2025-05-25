import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { WeatherService } from '../services/weather.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, HttpClientModule],
  providers: [WeatherService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  public socket!: Socket;
  public sidebarActive = false;
  public temperature: number = 25;
  public currentWeather: any = null;
  public yesterdayTemp: any = null;
  public tomorrowTemp: any = null;
  public isLoading = true;
  public isLoadingYesterday = true;
  public isLoadingTomorrow = true;
  public weatherError: string | null = null;
  public yesterdayError: string | null = null;
  public tomorrowError: string | null = null;
  public userPrediction: number | null = null;
  public userHumidityPrediction: number | null = null;
  public userYesterdayPrediction: number | null = null;
  public userYesterdayHumidityPrediction: number | null = null;
  public userTomorrowPrediction: number | null = null;
  public userTomorrowHumidityPrediction: number | null = null;

  // Coordenadas de Madrid
  private readonly MADRID_COORDS = {
    lat: 40.4168,
    lng: -3.7038
  };

  constructor(
    private router: Router,
    private weatherService: WeatherService
  ) { }

  ngOnInit(): void {
    this.initMap();
    this.initializeSocket();
    this.loadCurrentWeather();
    this.loadYesterdayTemp();
    this.loadTomorrowTemp();
  }

  loadCurrentWeather(): void {
    this.isLoading = true;
    this.weatherError = null;
    
    this.weatherService.getCurrentWeather(this.MADRID_COORDS.lat, this.MADRID_COORDS.lng)
      .subscribe({
        next: (data) => {
          this.currentWeather = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar el tiempo:', error);
          this.weatherError = error.message;
          this.isLoading = false;
        }
      });
  }

  loadYesterdayTemp(): void {
    this.isLoadingYesterday = true;
    this.yesterdayError = null;
    
    this.weatherService.getYesterdayTemp(this.MADRID_COORDS.lat, this.MADRID_COORDS.lng)
      .subscribe({
        next: (data) => {
          this.yesterdayTemp = data;
          this.isLoadingYesterday = false;
        },
        error: (error) => {
          console.error('Error al cargar temperatura de ayer:', error);
          this.yesterdayError = error.message;
          this.isLoadingYesterday = false;
        }
      });
  }

  loadTomorrowTemp(): void {
    this.isLoadingTomorrow = true;
    this.tomorrowError = null;
    
    this.weatherService.getTomorrowTemp(this.MADRID_COORDS.lat, this.MADRID_COORDS.lng)
      .subscribe({
        next: (data) => {
          this.tomorrowTemp = data;
          this.isLoadingTomorrow = false;
        },
        error: (error) => {
          console.error('Error al cargar temperatura de mañana:', error);
          this.tomorrowError = error.message;
          this.isLoadingTomorrow = false;
        }
      });
  }

  private initMap(): void {
    // Inicializamos el mapa centrado en Madrid con un zoom que muestre la península
    this.map = L.map('map', {
      zoomControl: false,  // Deshabilitamos los controles de zoom
      dragging: false,     // Deshabilitamos el arrastre
      touchZoom: false,    // Deshabilitamos zoom táctil
      scrollWheelZoom: false, // Deshabilitamos zoom con rueda
      doubleClickZoom: false, // Deshabilitamos zoom con doble clic
      boxZoom: false,      // Deshabilitamos zoom con caja
      keyboard: false,     // Deshabilitamos controles de teclado
    }).setView([38.9168, -3.7038], 6);  // Zoom 6 para ver la península

    // Añadimos el estilo claro del mapa
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 5,
      minZoom: 5
    }).addTo(this.map);

    // Crear el marcador personalizado verde
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #00ff9d; width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.8); box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);"></div>',
      iconSize: [15, 15],
      iconAnchor: [7.5, 7.5]
    });

    // Añadimos el marcador de Madrid
    L.marker([this.MADRID_COORDS.lat, this.MADRID_COORDS.lng], { icon: customIcon })
      .bindPopup(`
        <div style="text-align: center;">
          <h3 style="margin: 0; font-weight: 600;">Madrid</h3>
          <p style="margin: 5px 0 0; font-size: 12px; color: #666;">40.4168°N, 3.7038°W</p>
        </div>
      `)
      .addTo(this.map);
  }

  private initializeSocket(): void {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO');
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.map) {
      this.map.remove();
    }
  }
  
  logOut(): void { 
    this.router.navigate(["/homepage"]);
  }

  refreshPage(): void {
    if (this.map) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.map.setView([position.coords.latitude, position.coords.longitude], 15);
      });
    }
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  sendLocation(): void {
    this.router.navigate(['/sendlocation']);
  }
}
