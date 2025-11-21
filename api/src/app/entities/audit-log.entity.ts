import { AuditAction } from '@secure-task-mgmt/data';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  action!: AuditAction;

  @Column({ type: 'text', nullable: true })
  userId?: string;

  @Column({ type: 'text', nullable: true })
  organizationId?: string;

  @Column({ type: 'simple-json', nullable: true })
  context?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
