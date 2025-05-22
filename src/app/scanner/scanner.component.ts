import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scanner',
  imports: [],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss'
})
export class ScannerComponent {
  constructor(private router: Router) {}
  
  navigate(page: string): void {
    const path = `/${page}`;
    this.router.navigate([path]);
  }

  user(): void {
    this.router.navigate(['/profile']);
  }


}
