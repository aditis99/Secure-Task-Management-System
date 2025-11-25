import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  JwtPayload,
  LoginRequest,
  LoginResponse,
  RequestUser,
} from '@secure-task-mgmt/data';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'secure-task-token';
  private readonly userState = signal<RequestUser | null>(null);

  readonly userSignal = computed(() => this.userState());

  constructor(private readonly api: ApiService) {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.userState.set(decoded);
      }
    }
  }

  async login(credentials: LoginRequest): Promise<RequestUser> {
    const response = await firstValueFrom<LoginResponse>(this.api.login(credentials));
    this.persistToken(response.accessToken);
    const user = this.mapPayloadToUser(response.user);
    this.userState.set(user);
    return user;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userState.set(null);
  }

  isAuthenticated(): boolean {
    return Boolean(this.userState());
  }

  getUser(): RequestUser | null {
    return this.userState();
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  private persistToken(token: string) {
    localStorage.setItem(this.storageKey, token);
  }

  private decodeToken(token: string): RequestUser | null {
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload)) as JwtPayload;
      return this.mapPayloadToUser(decoded);
    } catch {
      return null;
    }
  }

  private mapPayloadToUser(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      permissions: payload.permissions ?? [],
    };
  }
}
