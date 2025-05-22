import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  
    constructor(private router: Router) {}
  
    navigate(page: string): void {
      const path = `/${page}`;
      this.router.navigate([path]);
    }
  
    qr(): void {
      this.router.navigate(['/scanner']);
    }

    event(): void {
      this.router.navigate(['/myevents']);
    }
  
    ngOnInit(): void {
     
    }
  
    goToSettings() {
      this.router.navigate(['/profile-settings']);
    }

}
