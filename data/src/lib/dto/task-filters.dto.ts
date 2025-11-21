import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskCategory } from '../enums/task-category.enum';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskFiltersDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskCategory)
  @IsOptional()
  category?: TaskCategory;

  @IsString()
  @IsOptional()
  search?: string;
}
