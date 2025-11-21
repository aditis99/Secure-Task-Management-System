import { TaskCategory } from '../enums/task-category.enum';
import { TaskStatus } from '../enums/task-status.enum';

export interface TaskFiltersRequest {
  status?: TaskStatus;
  category?: TaskCategory;
  search?: string;
}
