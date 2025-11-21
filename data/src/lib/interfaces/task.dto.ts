import { TaskCategory } from '../enums/task-category.enum';
import { TaskStatus } from '../enums/task-status.enum';

export interface TaskDto {
  id: string;
  title: string;
  description?: string | null;
  category: TaskCategory;
  status: TaskStatus;
  dueDate?: string | null;
  organization?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}
