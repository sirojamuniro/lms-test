import { AppDataSource } from '../../plugins/database.plugin';
import { Class } from '../../entities/class.entity';
import { User } from '../../entities/user.entity';

export interface CreateClassData {
    name: string;
    grade: string;
    major?: string;
    classNumber?: string;
    capacity?: number;
    room?: string;
    schoolId: number;
    academicYearId: number;
    homeroomTeacherId?: number;
}

export interface UpdateClassData {
    name?: string;
    capacity?: number;
    room?: string;
    isActive?: boolean;
    homeroomTeacherId?: number;
    settings?: Record<string, any>;
}

export interface ClassFilterOptions {
    schoolId?: number;
    academicYearId?: number;
    grade?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Classes service
 */
export class ClassesService {
    private classRepository = AppDataSource.getRepository(Class);
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Create a new class
     */
    async create(data: CreateClassData): Promise<Class> {
        // Check duplication
        const existingClass = await this.classRepository.findOne({
            where: {
                schoolId: data.schoolId,
                name: data.name,
                academicYearId: data.academicYearId
            },
        });

        if (existingClass) {
            const error = new Error('Class with this name already exists in this academic year') as any;
            error.statusCode = 409;
            throw error;
        }

        const newClass = this.classRepository.create(data);
        return this.classRepository.save(newClass);
    }

    /**
     * Find all classes with filters
     */
    async findAll(options: ClassFilterOptions = {}): Promise<{ data: Class[]; total: number }> {
        const { schoolId, academicYearId, grade, isActive, search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const query = this.classRepository.createQueryBuilder('class')
            .leftJoinAndSelect('class.homeroomTeacher', 'teacher')
            .leftJoinAndSelect('class.academicYear', 'academicYear')
            .select([
                'class',
                'teacher.id', 'teacher.firstName', 'teacher.lastName', 'teacher.email',
                'academicYear'
            ]);

        if (schoolId) {
            query.andWhere('class.schoolId = :schoolId', { schoolId });
        }

        if (academicYearId) {
            query.andWhere('class.academicYearId = :academicYearId', { academicYearId });
        }

        if (grade) {
            query.andWhere('class.grade = :grade', { grade });
        }

        if (isActive !== undefined) {
            query.andWhere('class.isActive = :isActive', { isActive });
        }

        if (search) {
            query.andWhere('class.name ILIKE :search', { search: `%${search}%` });
        }

        query.orderBy('class.grade', 'ASC')
            .addOrderBy('class.name', 'ASC')
            .skip(skip)
            .take(limit);

        const [data, total] = await query.getManyAndCount();

        return { data, total };
    }

    /**
     * Find class by ID
     */
    async findById(id: number): Promise<Class | null> {
        return this.classRepository.createQueryBuilder('class')
            .leftJoinAndSelect('class.homeroomTeacher', 'teacher')
            .leftJoinAndSelect('class.academicYear', 'academicYear')
            .leftJoinAndSelect('class.students', 'students') // Warning: could be large, maybe distinct endpoint for students
            .where('class.id = :id', { id })
            .select([
                'class',
                'teacher.id', 'teacher.firstName', 'teacher.lastName',
                'academicYear',
                'students.id', 'students.firstName', 'students.lastName', 'students.email'
            ])
            .getOne();
    }

    /**
     * Update class
     */
    async update(id: number, data: UpdateClassData): Promise<Class | null> {
        const cls = await this.classRepository.findOne({ where: { id } });

        if (!cls) {
            return null;
        }

        Object.assign(cls, data);
        return this.classRepository.save(cls);
    }

    /**
     * Delete class
     */
    async delete(id: number): Promise<boolean> {
        const result = await this.classRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * Assign student to class
     */
    async addStudent(classId: number, studentId: number): Promise<void> {
        const cls = await this.classRepository.findOne({
            where: { id: classId },
            relations: ['students']
        });

        if (!cls) throw new Error('Class not found');

        const student = await this.userRepository.findOne({ where: { id: studentId } });
        if (!student) throw new Error('Student not found');

        cls.students.push(student);
        await this.classRepository.save(cls);
    }

    /**
     * Remove student from class
     */
    async removeStudent(classId: number, studentId: number): Promise<void> {
        const cls = await this.classRepository.findOne({
            where: { id: classId },
            relations: ['students']
        });

        if (!cls) throw new Error('Class not found');

        cls.students = cls.students.filter(s => s.id !== studentId);
        await this.classRepository.save(cls);
    }
}

// Export singleton instance
export const classesService = new ClassesService();
