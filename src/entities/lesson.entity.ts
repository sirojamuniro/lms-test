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
import { LessonStatus } from '../types';
import { Course } from './course.entity';
import { Attachment } from './attachment.entity';
import { Progress } from './progress.entity';

@Entity('lessons')
export class Lesson {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ default: 0 })
    order: number;

    @Column({ default: 0 })
    duration: number;

    @Column({
        type: 'enum',
        enum: LessonStatus,
        default: LessonStatus.DRAFT,
    })
    status: LessonStatus;

    @Column({ nullable: true })
    videoUrl: string;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    courseId: number;

    @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @OneToMany(() => Attachment, (attachment) => attachment.lesson)
    attachments: Attachment[];

    @OneToMany(() => Progress, (progress) => progress.lesson)
    progress: Progress[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
