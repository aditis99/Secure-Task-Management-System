import { RoleName } from '@secure-task-mgmt/data';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { Task } from './task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @ManyToOne(() => Organization, (organization) => organization.users, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  organization?: Organization | null;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role!: Role;

  @Column({ type: 'text', default: RoleName.VIEWER })
  roleName!: RoleName;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks?: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
