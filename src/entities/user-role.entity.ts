import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    Index,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { School } from './school.entity';

/**
 * UserRole pivot table - links users to roles with optional school context
 * Allows a user to have different roles in different schools
 */
@Entity('user_roles')
@Index(['userId', 'roleId', 'schoolId'], { unique: true })
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * User
     */
    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    /**
     * Role assigned
     */
    @Column()
    roleId: number;

    @ManyToOne(() => Role, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roleId' })
    role: Role;

    /**
     * School context (null = global role)
     */
    @Column({ nullable: true })
    schoolId: number;

    @ManyToOne(() => School, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schoolId' })
    school: School;

    /**
     * Whether this role is currently active for the user
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * When this role was assigned
     */
    @CreateDateColumn()
    assignedAt: Date;

    /**
     * When this role expires (null = never)
     */
    @Column({ nullable: true })
    expiresAt: Date;

    /**
     * Who assigned this role
     */
    @Column({ nullable: true })
    assignedById: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assignedById' })
    assignedBy: User;
}
