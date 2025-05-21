import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class UserHomeComponent {
  constructor(private router: Router){}
  
  goTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
