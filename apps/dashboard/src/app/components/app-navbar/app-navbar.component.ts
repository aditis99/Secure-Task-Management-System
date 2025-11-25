import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  styleUrls: ['./app-navbar.component.css'],
  templateUrl: './app-navbar.component.html',
})
export class AppNavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/new-task', label: 'New Task' },
  ];

  readonly currentUser = this.auth.userSignal;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
