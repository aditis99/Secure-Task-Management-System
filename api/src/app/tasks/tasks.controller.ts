import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  CurrentUser,
  PermissionsRequired,
  RolesAllowed,
} from '@secure-task-mgmt/auth';
import {
  PermissionName,
  RequestUser,
  RoleName,
} from '@secure-task-mgmt/data';
import { CreateTaskDto, TaskFiltersDto, UpdateTaskDto } from '@secure-task-mgmt/data/backend';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RolesAllowed(RoleName.OWNER, RoleName.ADMIN)
  @PermissionsRequired(PermissionName.CREATE_TASK)
  createTask(@CurrentUser() user: RequestUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(user, dto);
  }

  @Get()
  @RolesAllowed(RoleName.OWNER, RoleName.ADMIN, RoleName.VIEWER)
  @PermissionsRequired(PermissionName.READ_TASK)
  getTasks(@CurrentUser() user: RequestUser, @Query() filters: TaskFiltersDto) {
    return this.tasksService.getTasks(user, filters);
  }

  @Get(':taskId')
  @RolesAllowed(RoleName.OWNER, RoleName.ADMIN, RoleName.VIEWER)
  @PermissionsRequired(PermissionName.READ_TASK)
  getTask(@Param('taskId') taskId: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.getTask(taskId, user);
  }

  @Put(':taskId')
  @RolesAllowed(RoleName.OWNER, RoleName.ADMIN)
  @PermissionsRequired(PermissionName.UPDATE_TASK)
  updateTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateTaskDto
  ) {
    return this.tasksService.updateTask(taskId, user, dto);
  }

  @Delete(':taskId')
  @RolesAllowed(RoleName.OWNER, RoleName.ADMIN)
  @PermissionsRequired(PermissionName.DELETE_TASK)
  deleteTask(@Param('taskId') taskId: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.deleteTask(taskId, user);
  }
}
