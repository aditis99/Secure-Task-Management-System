import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateTaskRequest,
  LoginRequest,
  LoginResponse,
  TaskDto,
  UpdateTaskRequest,
} from '@secure-task-mgmt/data';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  getTasks(): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(`${this.baseUrl}/tasks`);
  }

  getTask(taskId: string): Observable<TaskDto> {
    return this.http.get<TaskDto>(`${this.baseUrl}/tasks/${taskId}`);
  }

  createTask(task: CreateTaskRequest): Observable<TaskDto> {
    return this.http.post<TaskDto>(`${this.baseUrl}/tasks`, task);
  }

  updateTask(taskId: string, updates: UpdateTaskRequest): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${this.baseUrl}/tasks/${taskId}`, updates);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${taskId}`);
  }
}
