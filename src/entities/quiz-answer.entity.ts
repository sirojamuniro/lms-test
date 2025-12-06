import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';
import { QuizAttempt } from './quiz-attempt.entity';

@Entity('quiz_answers')
export class QuizAnswer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    answer: any;

    @Column({ default: false })
    isCorrect: boolean;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    score: number;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    questionId: number;

    @ManyToOne(() => QuizQuestion, (question) => question.answers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'questionId' })
    question: QuizQuestion;

    @Column()
    attemptId: number;

    @ManyToOne(() => QuizAttempt, (attempt) => attempt.answers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'attemptId' })
    attempt: QuizAttempt;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
