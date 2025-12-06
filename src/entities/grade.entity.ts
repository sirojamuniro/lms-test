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
import { User } from './user.entity';
import { Subject } from './subject.entity';
import { Assignment } from './assignment.entity';
import { Quiz } from './quiz.entity';

/**
 * Grade type enum
 */
export enum GradeType {
    DAILY = 'daily',             // Nilai Harian
    ASSIGNMENT = 'assignment',    // Tugas
    QUIZ = 'quiz',               // Kuis
    MIDTERM = 'midterm',         // UTS
    FINAL = 'final',             // UAS
    PRACTICAL = 'practical',      // Praktikum
    PROJECT = 'project',         // Proyek
}

/**
 * Grade entity - Nilai
 */
@Entity('grades')
@Index(['studentId', 'subjectId', 'gradeType'])
@Index(['subjectId', 'createdAt'])
export class Grade {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Score obtained
     */
    @Column({ type: 'decimal', precision: 5, scale: 2 })
    score: number;

    /**
     * Maximum possible score
     */
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
    maxScore: number;

    /**
     * Grade type
     */
    @Column({
        type: 'enum',
        enum: GradeType,
        default: GradeType.DAILY,
    })
    gradeType: GradeType;

    /**
     * Description/title of this grade
     */
    @Column({ nullable: true })
    title: string;

    /**
     * Notes/comments
     */
    @Column({ type: 'text', nullable: true })
    notes: string;

    /**
     * Kompetensi Dasar (KD) if applicable
     */
    @Column({ nullable: true })
    kdCode: string;

    /**
     * Weight of this grade in final calculation (0-1)
     */
    @Column({ type: 'decimal', precision: 3, scale: 2, default: 1 })
    weight: number;

    /**
     * Semester (1 or 2)
     */
    @Column({ default: 1 })
    semester: number;

    /**
     * Grade date
     */
    @Column({ type: 'date', nullable: true })
    gradedAt: Date;

    /**
     * Student who received this grade
     */
    @Column()
    studentId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: User;

    /**
     * Subject this grade belongs to
     */
    @Column()
    subjectId: number;

    @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;

    /**
     * Assignment (if grade is from assignment)
     */
    @Column({ nullable: true })
    assignmentId: number;

    @ManyToOne(() => Assignment, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assignmentId' })
    assignment: Assignment;

    /**
     * Quiz (if grade is from quiz)
     */
    @Column({ nullable: true })
    quizId: number;

    @ManyToOne(() => Quiz, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'quizId' })
    quiz: Quiz;

    /**
     * Teacher who gave this grade
     */
    @Column({ nullable: true })
    gradedById: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'gradedById' })
    gradedBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /**
     * Calculate percentage
     */
    get percentage(): number {
        return this.maxScore > 0 ? (Number(this.score) / Number(this.maxScore)) * 100 : 0;
    }
}
