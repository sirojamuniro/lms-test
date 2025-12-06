import { AppDataSource } from '../../plugins/database.plugin';
import { Course } from '../../entities/course.entity';
import { CourseStatus, UserRole } from '../../types';

export interface CreateCourseData {
    title: string;
    description?: string;
    shortDescription?: string;
    thumbnail?: string;
    price?: number;
    tags?: string[];
    learningObjectives?: string[];
    requirements?: string[];
    instructorId: number;
    schoolId: number;
}

export interface UpdateCourseData {
    title?: string;
    description?: string;
    shortDescription?: string;
    thumbnail?: string;
    status?: CourseStatus;
    price?: number;
    tags?: string[];
    learningObjectives?: string[];
    requirements?: string[];
}

export interface CourseFilterOptions {
    status?: CourseStatus;
    instructorId?: number;
    schoolId?: number; // Added
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Courses service
 */
export class CoursesService {
    private courseRepository = AppDataSource.getRepository(Course);

    /**
     * Create a new course
     */
    async create(data: CreateCourseData): Promise<Course> {
        const course = this.courseRepository.create(data);
        return this.courseRepository.save(course);
    }

    /**
     * Find all courses with filters
     */
    async findAll(options: CourseFilterOptions = {}, userRole?: string, userId?: number): Promise<{ data: Course[]; total: number }> {
        const { status, instructorId, schoolId, search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const query = this.courseRepository.createQueryBuilder('course')
            .leftJoinAndSelect('course.instructor', 'instructor')
            .select([
                'course',
                'instructor.id',
                'instructor.firstName',
                'instructor.lastName',
                'instructor.avatar',
            ]);

        // Filter based on role
        if (userRole === UserRole.STUDENT) {
            query.andWhere('course.status = :published', { published: CourseStatus.PUBLISHED });
        } else if (userRole === UserRole.INSTRUCTOR && userId) {
            query.andWhere('(course.status = :published OR course.instructorId = :userId)', {
                published: CourseStatus.PUBLISHED,
                userId,
            });
        }
        // Admin sees all

        if (status) {
            query.andWhere('course.status = :status', { status });
        }

        if (instructorId) {
            query.andWhere('course.instructorId = :instructorId', { instructorId });
        }

        // Multi-school filtering
        if (schoolId) {
            query.andWhere('course.schoolId = :schoolId', { schoolId });
        }

        // Default: If User is related to a school, should probably filter by school?
        // But for now, schoolId is passed in options if needed.

        if (search) {
            query.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        query.orderBy('course.createdAt', 'DESC')
            .skip(skip)
            .take(limit);

        const [data, total] = await query.getManyAndCount();

        return { data, total };
    }

    /**
     * Find course by ID
     */
    async findById(id: number, userRole?: string, userId?: number): Promise<Course | null> {
        const query = this.courseRepository.createQueryBuilder('course')
            .leftJoinAndSelect('course.instructor', 'instructor')
            .leftJoinAndSelect('course.lessons', 'lessons')
            .where('course.id = :id', { id });

        // Access control (Publish status)
        if (userRole === UserRole.STUDENT) {
            query.andWhere('course.status = :published', { published: CourseStatus.PUBLISHED });
        } else if (userRole === UserRole.INSTRUCTOR && userId) {
            query.andWhere('(course.status = :published OR course.instructorId = :userId)', {
                published: CourseStatus.PUBLISHED,
                userId,
            });
        }

        const course = await query.getOne();
        return course;
    }

    /**
     * Update course
     */
    async update(id: number, data: UpdateCourseData, userId: number, userRole: string): Promise<Course | null> {
        const course = await this.courseRepository.findOne({ where: { id } });

        if (!course) {
            return null;
        }

        // Check authorization
        if (userRole !== UserRole.ADMIN && userRole !== 'super_admin' && userRole !== 'school_admin' && course.instructorId !== userId) {
            const error = new Error('Not authorized to update this course') as any;
            error.statusCode = 403;
            throw error;
        }

        Object.assign(course, data);
        return this.courseRepository.save(course);
    }

    /**
     * Delete course
     */
    async delete(id: number, userId: number, userRole: string): Promise<boolean> {
        const course = await this.courseRepository.findOne({ where: { id } });

        if (!course) {
            return false;
        }

        // Check authorization
        if (userRole !== UserRole.ADMIN && userRole !== 'super_admin' && userRole !== 'school_admin' && course.instructorId !== userId) {
            const error = new Error('Not authorized to delete this course') as any;
            error.statusCode = 403;
            throw error;
        }

        const result = await this.courseRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * Get course with lessons
     */
    async getCourseWithLessons(id: number): Promise<Course | null> {
        return this.courseRepository.findOne({
            where: { id },
            relations: ['lessons', 'instructor'],
            order: { lessons: { order: 'ASC' } },
        });
    }

    /**
     * Update course statistics
     */
    async updateStats(id: number): Promise<void> {
        const course = await this.courseRepository.findOne({
            where: { id },
            relations: ['lessons', 'enrollments'],
        });

        if (course) {
            course.totalLessons = course.lessons?.length || 0;
            course.totalStudents = course.enrollments?.length || 0;
            course.duration = course.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0;
            await this.courseRepository.save(course);
        }
    }
}

// Export singleton instance
export const coursesService = new CoursesService();
