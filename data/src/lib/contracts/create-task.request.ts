import { TaskCategory } from '../enums/task-category.enum';
import { TaskStatus } from '../enums/task-status.enum';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  dueDate?: string;
  organizationId?: string;
}
