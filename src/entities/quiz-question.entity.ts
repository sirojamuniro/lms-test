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
import { QuestionType } from '../types';
import { Quiz } from './quiz.entity';
import { QuizAnswer } from './quiz-answer.entity';

@Entity('quiz_questions')
export class QuizQuestion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    question: string;

    @Column({
        type: 'enum',
        enum: QuestionType,
        default: QuestionType.MULTIPLE_CHOICE,
    })
    type: QuestionType;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
    points: number;

    @Column({ default: 0 })
    order: number;

    @Column({ type: 'json', nullable: true })
    options: string[];

    @Column({ type: 'json', nullable: true })
    correctAnswer: any;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    quizId: number;

    @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizId' })
    quiz: Quiz;

    @OneToMany(() => QuizAnswer, (answer) => answer.question)
    answers: QuizAnswer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
