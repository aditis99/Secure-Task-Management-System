import { Route } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { TaskFormPageComponent } from './pages/task-form-page/task-form-page.component';
import { AuthGuard } from './guards/auth.guard';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardPageComponent,
  },
  {
    path: 'new-task',
    canActivate: [AuthGuard],
    component: TaskFormPageComponent,
  },
  {
    path: 'edit-task/:id',
    canActivate: [AuthGuard],
    component: TaskFormPageComponent,
  },
  { path: '**', redirectTo: 'dashboard' },
];
