import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { ProgressStatus } from '../types';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { Enrollment } from './enrollment.entity';

@Entity('progress')
@Index(['userId', 'lessonId'], { unique: true })
export class Progress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ProgressStatus,
        default: ProgressStatus.NOT_STARTED,
    })
    status: ProgressStatus;

    @Column({ type: 'int', default: 0 })
    completionPercentage: number;

    @Column({ type: 'int', default: 0 })
    timeSpent: number;

    @Column({ nullable: true })
    lastAccessedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.progress)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    lessonId: number;

    @ManyToOne(() => Lesson, (lesson) => lesson.progress, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @Column({ nullable: true })
    enrollmentId: number;

    @ManyToOne(() => Enrollment, (enrollment) => enrollment.progress, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'enrollmentId' })
    enrollment: Enrollment;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
