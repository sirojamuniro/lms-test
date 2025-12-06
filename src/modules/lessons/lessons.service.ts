import { AppDataSource } from '../../plugins/database.plugin';
import { Lesson } from '../../entities/lesson.entity';
import { LessonStatus } from '../../types';
import { coursesService } from '../courses/courses.service';

export interface CreateLessonData {
    title: string;
    description?: string;
    content?: string;
    courseId: number;
    order?: number;
    duration?: number;
    videoUrl?: string;
}

export interface UpdateLessonData {
    title?: string;
    description?: string;
    content?: string;
    order?: number;
    duration?: number;
    status?: LessonStatus;
    videoUrl?: string;
}

/**
 * Lessons service
 */
export class LessonsService {
    private lessonRepository = AppDataSource.getRepository(Lesson);

    /**
     * Create a new lesson
     */
    async create(data: CreateLessonData): Promise<Lesson> {
        // Get max order for this course
        if (data.order === undefined) {
            const maxOrder = await this.lessonRepository
                .createQueryBuilder('lesson')
                .where('lesson.courseId = :courseId', { courseId: data.courseId })
                .select('MAX(lesson.order)', 'maxOrder')
                .getRawOne();

            data.order = (maxOrder?.maxOrder || 0) + 1;
        }

        const lesson = this.lessonRepository.create(data);
        const savedLesson = await this.lessonRepository.save(lesson);

        // Update course stats
        await coursesService.updateStats(data.courseId);

        return savedLesson;
    }

    /**
     * Find all lessons for a course
     */
    async findByCourse(courseId: number): Promise<Lesson[]> {
        return this.lessonRepository.find({
            where: { courseId },
            order: { order: 'ASC' },
        });
    }

    /**
     * Find lesson by ID
     */
    async findById(id: number): Promise<Lesson | null> {
        return this.lessonRepository.findOne({
            where: { id },
            relations: ['course', 'attachments'],
        });
    }

    /**
     * Update lesson
     */
    async update(id: number, data: UpdateLessonData): Promise<Lesson | null> {
        const lesson = await this.lessonRepository.findOne({ where: { id } });

        if (!lesson) {
            return null;
        }

        Object.assign(lesson, data);
        const savedLesson = await this.lessonRepository.save(lesson);

        // Update course stats if duration changed
        if (data.duration !== undefined) {
            await coursesService.updateStats(lesson.courseId);
        }

        return savedLesson;
    }

    /**
     * Delete lesson
     */
    async delete(id: number): Promise<boolean> {
        const lesson = await this.lessonRepository.findOne({ where: { id } });

        if (!lesson) {
            return false;
        }

        const courseId = lesson.courseId;
        const result = await this.lessonRepository.delete(id);

        // Update course stats
        await coursesService.updateStats(courseId);

        return (result.affected ?? 0) > 0;
    }

    /**
     * Reorder lessons - batch update with parallel execution
     */
    async reorder(courseId: number, lessonOrders: { id: number; order: number }[]): Promise<void> {
        await Promise.all(
            lessonOrders.map(item =>
                this.lessonRepository.update(item.id, { order: item.order })
            )
        );
    }

    /**
     * Get next lesson in course
     */
    async getNextLesson(courseId: number, currentOrder: number): Promise<Lesson | null> {
        return this.lessonRepository
            .createQueryBuilder('lesson')
            .where('lesson.courseId = :courseId', { courseId })
            .andWhere('lesson.status = :status', { status: LessonStatus.PUBLISHED })
            .andWhere('lesson.order > :currentOrder', { currentOrder })
            .orderBy('lesson.order', 'ASC')
            .getOne();
    }
}

// Export singleton instance
export const lessonsService = new LessonsService();
