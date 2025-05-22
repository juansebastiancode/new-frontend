import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  constructor(private router: Router) {}

  login() {
    this.router.navigate(["/login"]);
  }

  signup() {
    this.router.navigate(["/signup"]);
  }

 

}
