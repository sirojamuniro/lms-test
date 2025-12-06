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
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';
import { QuizQuestion } from './quiz-question.entity';
import { QuizAttempt } from './quiz-attempt.entity';

@Entity('quizzes')
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: 0 })
    timeLimit: number;

    @Column({ default: 100 })
    maxScore: number;

    @Column({ default: 1 })
    maxAttempts: number;

    @Column({ default: true })
    isActive: boolean;

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

    @OneToMany(() => QuizQuestion, (question) => question.quiz, { cascade: true })
    questions: QuizQuestion[];

    @OneToMany(() => QuizAttempt, (attempt) => attempt.quiz)
    attempts: QuizAttempt[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
