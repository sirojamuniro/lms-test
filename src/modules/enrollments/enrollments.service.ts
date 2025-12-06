import { AppDataSource } from '../../plugins/database.plugin';
import { Enrollment } from '../../entities/enrollment.entity';
import { EnrollmentStatus } from '../../types';

export interface CreateEnrollmentData {
    studentId: number;
    courseId: number;
    pricePaid?: number;
}

/**
 * Enrollments service
 */
export class EnrollmentsService {
    private enrollmentRepository = AppDataSource.getRepository(Enrollment);

    /**
     * Enroll student in course
     */
    async create(data: CreateEnrollmentData): Promise<Enrollment> {
        // Check if already enrolled
        const existing = await this.enrollmentRepository.findOne({
            where: {
                studentId: data.studentId,
                courseId: data.courseId,
            },
        });

        if (existing) {
            const error = new Error('Already enrolled in this course') as any;
            error.statusCode = 409;
            throw error;
        }

        const enrollment = this.enrollmentRepository.create({
            ...data,
            status: EnrollmentStatus.ACTIVE,
            enrolledAt: new Date(),
        });

        return this.enrollmentRepository.save(enrollment);
    }

    /**
     * Find enrollments for a user
     */
    async findByUser(studentId: number): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { studentId },
            relations: ['course', 'course.instructor'],
            order: { enrolledAt: 'DESC' },
        });
    }

    /**
     * Find enrollments for a course
     */
    async findByCourse(courseId: number): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { courseId },
            relations: ['student'],
            order: { enrolledAt: 'DESC' },
        });
    }

    /**
     * Find enrollment by ID
     */
    async findById(id: number): Promise<Enrollment | null> {
        return this.enrollmentRepository.findOne({
            where: { id },
            relations: ['student', 'course'],
        });
    }

    /**
     * Check if user is enrolled - optimized with exists()
     */
    async isEnrolled(studentId: number, courseId: number): Promise<boolean> {
        return this.enrollmentRepository.exists({
            where: { studentId, courseId, status: EnrollmentStatus.ACTIVE },
        });
    }

    /**
     * Update enrollment status
     */
    async updateStatus(id: number, status: EnrollmentStatus): Promise<Enrollment | null> {
        const enrollment = await this.enrollmentRepository.findOne({ where: { id } });

        if (!enrollment) {
            return null;
        }

        enrollment.status = status;

        if (status === EnrollmentStatus.COMPLETED) {
            enrollment.completedAt = new Date();
        }

        return this.enrollmentRepository.save(enrollment);
    }

    /**
     * Unenroll student
     */
    async delete(id: number): Promise<boolean> {
        const result = await this.enrollmentRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * Get enrollment statistics for a course
     */
    async getCourseStats(courseId: number): Promise<{
        total: number;
        active: number;
        completed: number;
        dropped: number;
    }> {
        const stats = await this.enrollmentRepository
            .createQueryBuilder('enrollment')
            .where('enrollment.courseId = :courseId', { courseId })
            .select('enrollment.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('enrollment.status')
            .getRawMany();

        const result = { total: 0, active: 0, completed: 0, dropped: 0 };

        stats.forEach((stat) => {
            const count = parseInt(stat.count, 10);
            result.total += count;
            if (stat.status === EnrollmentStatus.ACTIVE) result.active = count;
            if (stat.status === EnrollmentStatus.COMPLETED) result.completed = count;
            if (stat.status === EnrollmentStatus.DROPPED) result.dropped = count;
        });

        return result;
    }
}

// Export singleton instance
export const enrollmentsService = new EnrollmentsService();
