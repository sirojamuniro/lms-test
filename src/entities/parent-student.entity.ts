import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

/**
 * ParentStudent pivot table - links parents to their children (students)
 */
@Entity('parent_students')
@Index(['parentId', 'studentId'], { unique: true })
export class ParentStudent {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Parent user
     */
    @Column()
    parentId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentId' })
    parent: User;

    /**
     * Student (child)
     */
    @Column()
    studentId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: User;

    /**
     * Relationship type
     */
    @Column({ default: 'parent' })
    relationship: string; // 'parent', 'guardian', 'mother', 'father'

    /**
     * Whether this parent is the primary contact
     */
    @Column({ default: false })
    isPrimary: boolean;

    /**
     * Whether parent can view grades
     */
    @Column({ default: true })
    canViewGrades: boolean;

    /**
     * Whether parent can view attendance
     */
    @Column({ default: true })
    canViewAttendance: boolean;

    /**
     * Whether parent receives notifications
     */
    @Column({ default: true })
    receiveNotifications: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
