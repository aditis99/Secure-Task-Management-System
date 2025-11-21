import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RoleName, TaskDto } from '@secure-task-mgmt/data';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface TaskSummaryCard {
  label: string;
  value: string;
  trend?: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly summaryCards = signal<TaskSummaryCard[]>([
    { label: 'Open Tasks', value: '—', trend: 'Loading' },
    { label: 'Completed', value: '—', trend: '' },
    { label: 'Overdue', value: '—', trend: '' },
  ]);

  readonly tasks = signal<TaskDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);
  readonly deletingTaskId = signal<string | null>(null);
  readonly currentUser = this.auth.userSignal;
  readonly canManageTasks = computed(
    () => {
      const user = this.currentUser();
      return user ? [RoleName.ADMIN, RoleName.OWNER].includes(user.role) : false;
    }
  );

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);
    try {
      const response = await firstValueFrom(this.api.getTasks());
      this.tasks.set(response);
      this.updateSummaryCards(response);
    } catch {
      this.loadError.set('Unable to load tasks right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  trackByTaskId(_: number, task: TaskDto) {
    return task.id;
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.canManageTasks()) {
      return;
    }
    this.deletingTaskId.set(taskId);
    try {
      await firstValueFrom(this.api.deleteTask(taskId));
      this.tasks.update((taskList) => taskList.filter((task) => task.id !== taskId));
      this.updateSummaryCards(this.tasks());
    } catch {
      this.loadError.set('Unable to delete that task.');
    } finally {
      this.deletingTaskId.set(null);
    }
  }

  badgeClass(status: TaskDto['status']): string {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-100 text-emerald-700';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  private updateSummaryCards(tasks: TaskDto[]) {
    const open = tasks.filter((task) => task.status !== 'DONE').length;
    const completed = tasks.filter((task) => task.status === 'DONE').length;
    const overdue = tasks.filter(
      (task) =>
        task.dueDate &&
        task.status !== 'DONE' &&
        new Date(task.dueDate) < new Date()
    ).length;

    this.summaryCards.set([
      { label: 'Open Tasks', value: open.toString(), trend: open ? 'Active load' : 'All clear' },
      { label: 'Completed', value: completed.toString(), trend: completed ? 'Great progress' : 'No completions yet' },
      {
        label: 'Overdue',
        value: overdue.toString(),
        trend: overdue ? 'Needs attention' : 'On track',
      },
    ]);
  }
}
