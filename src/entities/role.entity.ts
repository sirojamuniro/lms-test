import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    ManyToOne,
    JoinColumn,
    JoinTable,
    Index,
} from 'typeorm';
import { Permission } from './permission.entity';
import { School } from './school.entity';

/**
 * Role entity for RBAC
 * Roles can be global (schoolId = null) or school-specific
 */
@Entity('roles')
@Index(['name', 'schoolId'], { unique: true })
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Role name (e.g., 'TEACHER', 'ADMIN', 'STUDENT')
     */
    @Column()
    name: string;

    /**
     * Display name for UI
     */
    @Column()
    displayName: string;

    /**
     * Role description
     */
    @Column({ type: 'text', nullable: true })
    description: string;

    /**
     * School this role belongs to (null = global/system role)
     */
    @Column({ nullable: true })
    schoolId: number;

    @ManyToOne(() => School, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schoolId' })
    school: School;

    /**
     * Whether this is a system role (cannot be deleted)
     */
    @Column({ default: false })
    isSystem: boolean;

    /**
     * Whether this role is active
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Role hierarchy level (higher = more permissions)
     * SUPER_ADMIN = 100, ADMIN = 90, PRINCIPAL = 80, etc.
     */
    @Column({ default: 0 })
    level: number;

    /**
     * Permissions assigned to this role
     */
    @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'roleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    })
    permissions: Permission[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /**
     * Check if role has a specific permission
     */
    hasPermission(permissionName: string): boolean {
        return this.permissions?.some(p => p.name === permissionName) ?? false;
    }

    /**
     * Check if role has permission for resource with action
     */
    can(resource: string, action: string): boolean {
        return this.permissions?.some(
            p => p.resource === resource && (p.action === action || p.action === 'manage')
        ) ?? false;
    }
}
