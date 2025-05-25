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

    dashboard(): void {
      this.router.navigate(['/dashboard']);
    }
  
    ngOnInit(): void {
     
    }
  
    goToSettings() {
      this.router.navigate(['/profile-settings']);
    }

    profileSettings(): void {
      this.router.navigate(['/profile-settings']);
    }

    sendLocation(): void {
      this.router.navigate(['/sendlocation']);
    }

    goToNewEvent(): void {
      this.router.navigate(['/new-event']);
    }

}
