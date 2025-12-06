import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { AssignmentStatus } from '../types';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';
import { AssignmentSubmission } from './assignment-submission.entity';

@Entity('assignments')
export class Assignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    instructions: string;

    @Column({
        type: 'enum',
        enum: AssignmentStatus,
        default: AssignmentStatus.DRAFT,
    })
    status: AssignmentStatus;

    @Column({ default: 100 })
    maxScore: number;

    @Column({ nullable: true })
    dueDate: Date;

    @Column({ type: 'json', nullable: true })
    allowedFileTypes: string[];

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    courseId: number;

    @ManyToOne(() => Course, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @Column({ nullable: true })
    lessonId: number;

    @ManyToOne(() => Lesson, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @OneToMany(() => AssignmentSubmission, (submission) => submission.assignment)
    submissions: AssignmentSubmission[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
