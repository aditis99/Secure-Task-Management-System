import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  CurrentUser,
  RolesAllowed,
} from '@secure-task-mgmt/auth';
import {
  RequestUser,
  RoleName,
} from '@secure-task-mgmt/data';
import { CreateOrganizationDto } from '@secure-task-mgmt/data/backend';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @RolesAllowed(RoleName.OWNER)
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.createOrganization(dto);
  }

  @Get()
  async listForUser(@CurrentUser() user: RequestUser) {
    return this.organizationsService.listOrganizationsForUser(user);
  }
}
