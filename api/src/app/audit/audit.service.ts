import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditAction, RequestUser } from '@secure-task-mgmt/data';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>
  ) {}

  async record(
    action: AuditAction,
    payload: {
      user?: RequestUser | null;
      organizationId?: string;
      context?: Record<string, unknown>;
    } = {}
  ): Promise<void> {
    const entry = this.auditRepository.create({
      action,
      userId: payload.user?.id,
      organizationId: payload.organizationId ?? payload.user?.organizationId,
      context: payload.context,
    });
    await this.auditRepository.save(entry);
    this.logger.log(
      `[${action}] user=${entry.userId ?? 'system'} org=${entry.organizationId ?? 'n/a'}`
    );
  }

  async findRecent(limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({ order: { createdAt: 'DESC' }, take: limit });
  }
}
