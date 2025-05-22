import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-page',
  imports: [],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.css'
})
export class HelpPageComponent {

  
    constructor(private router: Router) {}
  
    navigate(page: string): void {
      const path = `/${page}`;
      this.router.navigate([path]);
    }
  
    logOut(): void {
      this.router.navigate(['/homepage']);
    }
  
    ngOnInit(): void {
     
    }
  
  


}
