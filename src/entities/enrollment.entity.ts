import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { EnrollmentStatus } from '../types';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Progress } from './progress.entity';

@Entity('enrollments')
@Index(['studentId', 'courseId'], { unique: true })
export class Enrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.PENDING,
    })
    status: EnrollmentStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    pricePaid: number;

    @Column({ nullable: true })
    enrolledAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    studentId: number;

    @ManyToOne(() => User, (user) => user.enrollments)
    @JoinColumn({ name: 'studentId' })
    student: User;

    @Column()
    courseId: number;

    @ManyToOne(() => Course, (course) => course.enrollments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @OneToMany(() => Progress, (progress) => progress.enrollment)
    progress: Progress[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
