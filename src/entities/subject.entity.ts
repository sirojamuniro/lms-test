import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from './user.entity';
import { Course } from './course.entity';

/**
 * Subject entity - Mata Pelajaran (e.g., Matematika, Fisika)
 */
@Entity('subjects')
@Index(['classId', 'code'], { unique: true })
export class Subject {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Subject name (e.g., 'Matematika', 'Bahasa Indonesia')
     */
    @Column()
    name: string;

    /**
     * Subject code (e.g., 'MTK', 'BIN')
     */
    @Column()
    code: string;

    /**
     * Subject description
     */
    @Column({ type: 'text', nullable: true })
    description: string;

    /**
     * Credit hours per week (SKS/Jam)
     */
    @Column({ default: 2 })
    creditHours: number;

    /**
     * Whether subject is active
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Subject color for UI display
     */
    @Column({ nullable: true })
    color: string;

    /**
     * Subject icon
     */
    @Column({ nullable: true })
    icon: string;

    /**
     * Additional metadata
     */
    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    /**
     * Class this subject is taught in
     */
    @Column()
    classId: number;

    @ManyToOne(() => Class, (cls) => cls.subjects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'classId' })
    class: Class;

    /**
     * Teacher assigned to this subject
     */
    @Column()
    teacherId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'teacherId' })
    teacher: User;

    /**
     * Courses/materials for this subject
     * Links to existing Course entity for LMS content
     */
    @OneToMany(() => Course, (course) => course.subject)
    courses: Course[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
