import { AppDataSource } from '../../plugins/database.plugin';
import { Progress } from '../../entities/progress.entity';
import { ProgressStatus } from '../../types';

export interface UpdateProgressData {
    status?: ProgressStatus;
    completionPercentage?: number;
    timeSpent?: number;
}

/**
 * Progress service
 */
export class ProgressService {
    private progressRepository = AppDataSource.getRepository(Progress);

    /**
     * Get or create progress record
     */
    async getOrCreate(userId: number, lessonId: number, enrollmentId?: number): Promise<Progress> {
        let progress = await this.progressRepository.findOne({
            where: { userId, lessonId },
        });

        if (!progress) {
            progress = this.progressRepository.create({
                userId,
                lessonId,
                enrollmentId,
                status: ProgressStatus.NOT_STARTED,
            });
            progress = await this.progressRepository.save(progress);
        }

        return progress;
    }

    /**
     * Update progress
     */
    async update(userId: number, lessonId: number, data: UpdateProgressData): Promise<Progress> {
        let progress = await this.getOrCreate(userId, lessonId);

        // Update last accessed
        progress.lastAccessedAt = new Date();

        // Update fields
        if (data.status) progress.status = data.status;
        if (data.completionPercentage !== undefined) {
            progress.completionPercentage = data.completionPercentage;
        }
        if (data.timeSpent !== undefined) {
            progress.timeSpent += data.timeSpent;
        }

        // Mark as completed if 100%
        if (progress.completionPercentage >= 100) {
            progress.status = ProgressStatus.COMPLETED;
            progress.completedAt = new Date();
        } else if (progress.completionPercentage > 0) {
            progress.status = ProgressStatus.IN_PROGRESS;
        }

        return this.progressRepository.save(progress);
    }

    /**
     * Get progress for a user's enrollment
     */
    async getByEnrollment(enrollmentId: number): Promise<Progress[]> {
        return this.progressRepository.find({
            where: { enrollmentId },
            relations: ['lesson'],
            order: { lesson: { order: 'ASC' } },
        });
    }

    /**
     * Get progress for a user in a course - optimized with aggregate query
     */
    async getUserCourseProgress(userId: number, courseId: number): Promise<{
        completed: number;
        total: number;
        percentage: number;
    }> {
        const result = await this.progressRepository
            .createQueryBuilder('progress')
            .leftJoin('progress.lesson', 'lesson')
            .select('COUNT(*)', 'total')
            .addSelect(
                `SUM(CASE WHEN progress.status = :completedStatus THEN 1 ELSE 0 END)`,
                'completed'
            )
            .where('progress.userId = :userId', { userId })
            .andWhere('lesson.courseId = :courseId', { courseId })
            .setParameter('completedStatus', ProgressStatus.COMPLETED)
            .getRawOne();

        const total = parseInt(result?.total || '0', 10);
        const completed = parseInt(result?.completed || '0', 10);
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    }

    /**
     * Mark lesson as complete
     */
    async markComplete(userId: number, lessonId: number): Promise<Progress> {
        return this.update(userId, lessonId, {
            status: ProgressStatus.COMPLETED,
            completionPercentage: 100,
        });
    }
}

// Export singleton instance
export const progressService = new ProgressService();
