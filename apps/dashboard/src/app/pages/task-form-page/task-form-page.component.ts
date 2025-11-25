import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CreateTaskRequest, TaskCategory, TaskStatus, UpdateTaskRequest } from '@secure-task-mgmt/data';
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
export class TaskFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
  readonly loading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly pageTitle = signal('Create New Task');

  private taskId: string | null = null;

  readonly taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    category: [this.categories[0].value, Validators.required],
    status: [this.statuses[0].value, Validators.required],
    dueDate: [''],
  });

  async ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEditMode.set(true);
      this.pageTitle.set('Edit Task');
      await this.loadTask();
    }
  }

  private async loadTask() {
    if (!this.taskId) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    
    try {
      const task = await firstValueFrom(this.api.getTask(this.taskId));
      
      // Format the due date for the input field
      const dueDateValue = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
      
      this.taskForm.patchValue({
        title: task.title,
        description: task.description || '',
        category: task.category,
        status: task.status,
        dueDate: dueDateValue,
      });
    } catch (error) {
      this.errorMessage.set('Unable to load task. Please try again.');
      console.error('Error loading task:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    try {
      if (this.isEditMode() && this.taskId) {
        // Update existing task
        const payload: UpdateTaskRequest = {
          ...(this.taskForm.value as UpdateTaskRequest),
          dueDate: this.taskForm.value.dueDate || undefined,
        };
        await firstValueFrom(this.api.updateTask(this.taskId, payload));
        this.successMessage.set('Task updated successfully.');
        
        // Navigate back to dashboard after successful update
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      } else {
        // Create new task
        const payload: CreateTaskRequest = {
          ...(this.taskForm.value as CreateTaskRequest),
          dueDate: this.taskForm.value.dueDate || undefined,
        };
        await firstValueFrom(this.api.createTask(payload));
        this.successMessage.set('Task created successfully.');
        this.taskForm.reset({
          category: this.categories[0].value,
          status: this.statuses[0].value,
        });
      }
    } catch (error) {
      const action = this.isEditMode() ? 'update' : 'create';
      this.errorMessage.set(`Unable to ${action} the task. Please try again.`);
      console.error(`Error ${action}ing task:`, error);
    } finally {
      this.submitting.set(false);
    }
  }
}
