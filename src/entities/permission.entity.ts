import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    Index,
} from 'typeorm';
import { Role } from './role.entity';

/**
 * Permission entity for granular access control
 * Format: resource:action (e.g., 'course:create', 'grade:view')
 */
@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Full permission name (e.g., 'course:create')
     */
    @Column({ unique: true })
    name: string;

    /**
     * Resource being accessed (e.g., 'course', 'school', 'grade')
     */
    @Column()
    resource: string;

    /**
     * Action being performed (e.g., 'create', 'read', 'update', 'delete', 'manage')
     */
    @Column()
    action: string;

    /**
     * Human-readable description
     */
    @Column({ type: 'text', nullable: true })
    description: string;

    /**
     * Module/group this permission belongs to
     */
    @Column({ nullable: true })
    module: string;

    /**
     * Whether this is a system permission (cannot be deleted)
     */
    @Column({ default: false })
    isSystem: boolean;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
