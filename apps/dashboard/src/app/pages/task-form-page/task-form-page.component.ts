import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CreateTaskRequest, TaskCategory, TaskStatus } from '@secure-task-mgmt/data';
import { ApiService } from '../../services/api.service';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form-page.component.html',
  styleUrls: ['./task-form-page.component.css'],
})
export class TaskFormPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly categories: SelectOption<TaskCategory>[] = [
    { label: 'Work', value: TaskCategory.WORK },
    { label: 'Personal', value: TaskCategory.PERSONAL },
    { label: 'Urgent', value: TaskCategory.URGENT },
    { label: 'Other', value: TaskCategory.OTHER },
  ];
  readonly statuses: SelectOption<TaskStatus>[] = [
    { label: 'To do', value: TaskStatus.TODO },
    { label: 'In progress', value: TaskStatus.IN_PROGRESS },
    { label: 'Done', value: TaskStatus.DONE },
  ];
  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    category: [this.categories[0].value, Validators.required],
    status: [this.statuses[0].value, Validators.required],
    dueDate: [''],
  });

  async submit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const payload: CreateTaskRequest = {
      ...(this.taskForm.value as CreateTaskRequest),
      dueDate: this.taskForm.value.dueDate || undefined,
    };
    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    try {
      await firstValueFrom(this.api.createTask(payload));
      this.successMessage.set('Task saved successfully.');
      this.taskForm.reset({
        category: this.categories[0].value,
        status: this.statuses[0].value,
      });
    } catch {
      this.errorMessage.set('Unable to save the task. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
