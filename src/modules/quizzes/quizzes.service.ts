import { AppDataSource } from '../../plugins/database.plugin';
import { Quiz } from '../../entities/quiz.entity';
import { QuizQuestion } from '../../entities/quiz-question.entity';
import { QuizAttempt } from '../../entities/quiz-attempt.entity';
import { QuizAnswer } from '../../entities/quiz-answer.entity';

export interface CreateQuizData {
    title: string;
    description?: string;
    timeLimit?: number;
    maxScore?: number;
    maxAttempts?: number;
    courseId?: number;
    lessonId?: number;
}

export interface SubmitAnswerData {
    questionId: number;
    answer: any;
}

/**
 * Quizzes service
 */
export class QuizzesService {
    private quizRepository = AppDataSource.getRepository(Quiz);
    private questionRepository = AppDataSource.getRepository(QuizQuestion);
    private attemptRepository = AppDataSource.getRepository(QuizAttempt);
    private answerRepository = AppDataSource.getRepository(QuizAnswer);

    /**
     * Create a new quiz
     */
    async create(data: CreateQuizData): Promise<Quiz> {
        const quiz = this.quizRepository.create(data);
        return this.quizRepository.save(quiz);
    }

    /**
     * Find quiz by ID
     */
    async findById(id: number, includeQuestions = false): Promise<Quiz | null> {
        const relations = includeQuestions ? ['questions'] : [];
        return this.quizRepository.findOne({
            where: { id },
            relations,
            order: includeQuestions ? { questions: { order: 'ASC' } } : undefined,
        });
    }

    /**
     * Find quizzes by course
     */
    async findByCourse(courseId: number): Promise<Quiz[]> {
        return this.quizRepository.find({
            where: { courseId },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Update quiz
     */
    async update(id: number, data: Partial<CreateQuizData>): Promise<Quiz | null> {
        const quiz = await this.quizRepository.findOne({ where: { id } });
        if (!quiz) return null;

        Object.assign(quiz, data);
        return this.quizRepository.save(quiz);
    }

    /**
     * Delete quiz
     */
    async delete(id: number): Promise<boolean> {
        const result = await this.quizRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * Add question to quiz
     */
    async addQuestion(quizId: number, data: Partial<QuizQuestion>): Promise<QuizQuestion> {
        const question = this.questionRepository.create({ ...data, quizId });
        return this.questionRepository.save(question);
    }

    /**
     * Start a quiz attempt
     */
    async startAttempt(userId: number, quizId: number): Promise<QuizAttempt> {
        const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Check max attempts
        const existingAttempts = await this.attemptRepository.count({
            where: { userId, quizId },
        });

        if (existingAttempts >= quiz.maxAttempts) {
            const error = new Error('Maximum attempts reached') as any;
            error.statusCode = 400;
            throw error;
        }

        const attempt = this.attemptRepository.create({
            userId,
            quizId,
            maxScore: quiz.maxScore,
            startedAt: new Date(),
        });

        return this.attemptRepository.save(attempt);
    }

    /**
     * Submit quiz answers - optimized with batch insert
     */
    async submitAttempt(attemptId: number, answers: SubmitAnswerData[]): Promise<QuizAttempt> {
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId },
            relations: ['quiz', 'quiz.questions'],
        });

        if (!attempt) {
            throw new Error('Attempt not found');
        }

        let totalScore = 0;

        // Process and prepare all answers
        const answerEntities = answers
            .map(answerData => {
                const question = attempt.quiz.questions.find(q => q.id === answerData.questionId);
                if (!question) return null;

                const isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(answerData.answer);
                const score = isCorrect ? Number(question.points) : 0;
                totalScore += score;

                return this.answerRepository.create({
                    attemptId,
                    questionId: answerData.questionId,
                    answer: answerData.answer,
                    isCorrect,
                    score,
                });
            })
            .filter((answer): answer is QuizAnswer => answer !== null);

        // Batch insert all answers
        if (answerEntities.length > 0) {
            await this.answerRepository.insert(answerEntities);
        }

        // Update attempt
        attempt.score = totalScore;
        attempt.percentage = (totalScore / attempt.maxScore) * 100;
        attempt.isPassed = attempt.percentage >= 60; // 60% passing grade
        attempt.completedAt = new Date();
        attempt.timeSpent = Math.floor(
            (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000
        );

        return this.attemptRepository.save(attempt);
    }

    /**
     * Get attempt results
     */
    async getAttemptResults(attemptId: number): Promise<QuizAttempt | null> {
        return this.attemptRepository.findOne({
            where: { id: attemptId },
            relations: ['answers', 'answers.question', 'quiz'],
        });
    }

    /**
     * Get user's attempts for a quiz
     */
    async getUserAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
        return this.attemptRepository.find({
            where: { userId, quizId },
            order: { createdAt: 'DESC' },
        });
    }
}

// Export singleton instance
export const quizzesService = new QuizzesService();
