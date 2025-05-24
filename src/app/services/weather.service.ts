import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) { }

  getCurrentWeather(lat: number, lon: number): Observable<any> {
    const url = `${this.apiUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=Europe/Madrid`;
    
    return this.http.get(url).pipe(
      map((response: any) => ({
        temp: Number(response.current.temperature_2m).toFixed(2),
        feels_like: Number(response.current.apparent_temperature).toFixed(2),
        humidity: response.current.relative_humidity_2m,
        description: this.getWeatherDescription(response.current.weather_code),
        icon: this.getWeatherIcon(response.current.weather_code)
      })),
      catchError(this.handleError)
    );
  }

  getYesterdayTemp(lat: number, lon: number): Observable<any> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0];

    const url = `${this.apiUrl}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=Europe/Madrid&start_date=${formattedDate}&end_date=${formattedDate}`;
    
    return this.http.get(url).pipe(
      map((response: any) => {
        // Obtener la temperatura a las 12:00 (índice 12 en el array horario)
        const temp12 = response.hourly.temperature_2m[12];
        return {
          temp12: Number(temp12).toFixed(2),
          date: formattedDate
        };
      }),
      catchError(this.handleError)
    );
  }

  getTomorrowTemp(lat: number, lon: number): Observable<any> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];

    const url = `${this.apiUrl}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=Europe/Madrid&start_date=${formattedDate}&end_date=${formattedDate}`;
    
    return this.http.get(url).pipe(
      map((response: any) => {
        // Obtener la temperatura a las 12:00 (índice 12 en el array horario)
        const temp12 = response.hourly.temperature_2m[12];
        return {
          temp12: Number(temp12).toFixed(2),
          date: formattedDate
        };
      }),
      catchError(this.handleError)
    );
  }

  private getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia fuerte',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve fuerte',
      77: 'Granos de nieve',
      80: 'Lluvia ligera',
      81: 'Lluvia moderada',
      82: 'Lluvia violenta',
      85: 'Nieve ligera',
      86: 'Nieve fuerte',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo fuerte'
    };
    return descriptions[code] || 'Desconocido';
  }

  private getWeatherIcon(code: number): string {
    // Mapeamos los códigos de Open-Meteo a iconos de Font Awesome
    const icons: { [key: number]: string } = {
      0: 'sun',                    // Despejado
      1: 'sun',                    // Mayormente despejado
      2: 'cloud-sun',              // Parcialmente nublado
      3: 'cloud',                  // Nublado
      45: 'smog',                  // Niebla
      48: 'smog',                  // Niebla con escarcha
      51: 'cloud-rain',            // Llovizna ligera
      53: 'cloud-rain',            // Llovizna moderada
      55: 'cloud-rain',            // Llovizna intensa
      61: 'cloud-showers-heavy',   // Lluvia ligera
      63: 'cloud-showers-heavy',   // Lluvia moderada
      65: 'cloud-showers-heavy',   // Lluvia fuerte
      71: 'snowflake',            // Nieve ligera
      73: 'snowflake',            // Nieve moderada
      75: 'snowflake',            // Nieve fuerte
      77: 'snowflake',            // Granos de nieve
      80: 'cloud-rain',            // Lluvia ligera
      81: 'cloud-rain',            // Lluvia moderada
      82: 'cloud-rain',            // Lluvia violenta
      85: 'snowflake',            // Nieve ligera
      86: 'snowflake',            // Nieve fuerte
      95: 'bolt',                  // Tormenta
      96: 'cloud-bolt',           // Tormenta con granizo ligero
      99: 'cloud-bolt'            // Tormenta con granizo fuerte
    };
    return icons[code] || 'question';
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error al obtener los datos del tiempo';
    
    if (error.status === 404) {
      errorMessage = 'No se encontraron datos para esta ubicación';
    } else if (error.status === 400) {
      errorMessage = 'Parámetros de búsqueda incorrectos';
    }

    console.error('Error detallado:', error);
    return throwError(() => new Error(errorMessage));
  }
} 