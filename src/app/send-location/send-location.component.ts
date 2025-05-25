import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-send-location',
  standalone: true,
  imports: [],
  providers: [WeatherService],
  templateUrl: './send-location.component.html'
})
export class SendLocationComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private cities = [
    { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
    { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
    { name: 'Sevilla', lat: 37.3891, lng: -5.9845 },
    { name: 'Bilbao', lat: 43.2603, lng: -2.9340 },
    { name: 'Zaragoza', lat: 41.6488, lng: -0.8891 },
    { name: 'Málaga', lat: 36.7213, lng: -4.4217 },
    { name: 'Murcia', lat: 37.9922, lng: -1.1307 },
    { name: 'Palma', lat: 39.5696, lng: 2.6502 },
    { name: 'Las Palmas', lat: 28.1235, lng: -15.4366 }
  ];

  constructor(
    private router: Router,
    private weatherService: WeatherService
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.loadTemperatures();
  }

  private initMap(): void {
    this.map = L.map('map', {
      zoomControl: false,  // Solo ocultamos los controles visuales de zoom
    }).setView([40.4168, -3.7038], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      minZoom: 3
    }).addTo(this.map);
  }

  private loadTemperatures(): void {
    this.cities.forEach(city => {
      this.weatherService.getCurrentWeather(city.lat, city.lng).subscribe({
        next: (data: any) => {
          const temp = Math.round(data.main.temp);
          const color = this.getTemperatureColor(temp);
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background-color: ${color}; 
              width: 30px; 
              height: 30px; 
              border-radius: 50%; 
              border: 2px solid rgba(255, 255, 255, 0.8);
              box-shadow: 0 0 10px ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">${temp}°</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          L.marker([city.lat, city.lng], { icon: customIcon })
            .bindPopup(`
              <div style="text-align: center;">
                <h3 style="margin: 0; font-weight: 600;">${city.name}</h3>
                <p style="margin: 5px 0 0; font-size: 14px;">${temp}°C</p>
              </div>
            `)
            .addTo(this.map);
        },
        error: (error) => {
          console.error('Error al cargar temperatura para', city.name, error);
        }
      });
    });
  }

  private getTemperatureColor(temp: number): string {
    if (temp > 25) return '#ff4444';
    if (temp > 15) return '#ffeb3b';
    return '#2196f3';
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
