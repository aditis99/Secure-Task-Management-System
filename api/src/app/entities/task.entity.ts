import { TaskCategory, TaskStatus } from '@secure-task-mgmt/data';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', default: TaskCategory.WORK })
  category!: TaskCategory;

  @Column({ type: 'text', default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date | null;

  @ManyToOne(() => Organization, (organization) => organization.tasks, {
    onDelete: 'CASCADE',
    eager: true,
  })
  organization!: Organization;

  @ManyToOne(() => User, (user) => user.createdTasks, { onDelete: 'SET NULL', eager: true })
  createdBy!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
