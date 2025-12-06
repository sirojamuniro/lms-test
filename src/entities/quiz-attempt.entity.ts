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
import { User } from './user.entity';
import { Quiz } from './quiz.entity';
import { QuizAnswer } from './quiz-answer.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    score: number;

    @Column({ default: 0 })
    maxScore: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    percentage: number;

    @Column({ default: false })
    isPassed: boolean;

    @Column({ nullable: true })
    startedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ default: 0 })
    timeSpent: number;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    quizId: number;

    @ManyToOne(() => Quiz, (quiz) => quiz.attempts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizId' })
    quiz: Quiz;

    @OneToMany(() => QuizAnswer, (answer) => answer.attempt, { cascade: true })
    answers: QuizAnswer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
