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
import { CourseStatus } from '../types';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { Enrollment } from './enrollment.entity';
import { Attachment } from './attachment.entity';
import { Subject } from './subject.entity';
import { School } from './school.entity';

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    shortDescription: string;

    @Column({ nullable: true })
    thumbnail: string;

    @Column({
        type: 'enum',
        enum: CourseStatus,
        default: CourseStatus.DRAFT,
    })
    status: CourseStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @Column({ default: 0 })
    duration: number;

    @Column({ default: 0 })
    totalLessons: number;

    @Column({ default: 0 })
    totalStudents: number;

    @Column({ default: 0 })
    rating: number;

    @Column({ default: 0 })
    totalRatings: number;

    @Column({ type: 'json', nullable: true })
    tags: string[];

    @Column({ type: 'json', nullable: true })
    learningObjectives: string[];

    @Column({ type: 'json', nullable: true })
    requirements: string[];

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    instructorId: number;

    @ManyToOne(() => User, (user) => user.courses)
    @JoinColumn({ name: 'instructorId' })
    instructor: User;

    /**
     * Subject this course belongs to (for school LMS)
     */
    @Column({ nullable: true })
    subjectId: number;

    @ManyToOne(() => Subject, (subject) => subject.courses, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;

    /**
     * School this course belongs to (for multi-school)
     */
    @Column({ nullable: true })
    schoolId: number;

    @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'schoolId' })
    school: School;

    @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
    lessons: Lesson[];

    @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
    enrollments: Enrollment[];

    @OneToMany(() => Attachment, (attachment) => attachment.course)
    attachments: Attachment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
