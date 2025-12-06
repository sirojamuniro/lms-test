import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SubmissionStatus } from '../types';
import { Assignment } from './assignment.entity';
import { User } from './user.entity';

@Entity('assignment_submissions')
export class AssignmentSubmission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ nullable: true })
    filePath: string;

    @Column({ nullable: true })
    fileName: string;

    @Column({
        type: 'enum',
        enum: SubmissionStatus,
        default: SubmissionStatus.PENDING,
    })
    status: SubmissionStatus;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    score: number;

    @Column({ type: 'text', nullable: true })
    feedback: string;

    @Column({ nullable: true })
    submittedAt: Date;

    @Column({ nullable: true })
    gradedAt: Date;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    assignmentId: number;

    @ManyToOne(() => Assignment, (assignment) => assignment.submissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assignmentId' })
    assignment: Assignment;

    @Column()
    studentId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'studentId' })
    student: User;

    @Column({ nullable: true })
    gradedById: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'gradedById' })
    gradedBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
