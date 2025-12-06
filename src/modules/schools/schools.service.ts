import { AppDataSource } from '../../plugins/database.plugin';
import { School, SchoolLevel } from '../../entities/school.entity';
import { Foundation } from '../../entities/foundation.entity';

export interface CreateSchoolData {
    name: string;
    code: string;
    npsn?: string;
    level: SchoolLevel;
    address?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    foundationId?: number;
}

export interface UpdateSchoolData {
    name?: string;
    level?: SchoolLevel;
    address?: string;
    npsn?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    isActive?: boolean;
    logoUrl?: string;
    bannerUrl?: string;
    branding?: Record<string, any>;
    settings?: Record<string, any>;
}

export interface SchoolFilterOptions {
    foundationId?: number;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Schools service
 */
export class SchoolsService {
    private schoolRepository = AppDataSource.getRepository(School);
    private foundationRepository = AppDataSource.getRepository(Foundation);

    /**
     * Create a new school
     */
    async create(data: CreateSchoolData): Promise<School> {
        const existingSchool = await this.schoolRepository.findOne({
            where: [{ code: data.code }, { npsn: data.npsn }],
        });

        if (existingSchool) {
            const error = new Error('School with this code or NPSN already exists') as any;
            error.statusCode = 409;
            throw error;
        }

        const school = this.schoolRepository.create(data);
        return this.schoolRepository.save(school);
    }

    /**
     * Find all schools with filters
     */
    async findAll(options: SchoolFilterOptions = {}): Promise<{ data: School[]; total: number }> {
        const { foundationId, isActive, search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const query = this.schoolRepository.createQueryBuilder('school')
            .leftJoinAndSelect('school.foundation', 'foundation');

        if (foundationId) {
            query.andWhere('school.foundationId = :foundationId', { foundationId });
        }

        if (isActive !== undefined) {
            query.andWhere('school.isActive = :isActive', { isActive });
        }

        if (search) {
            query.andWhere(
                '(school.name ILIKE :search OR school.code ILIKE :search OR school.npsn ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        query.orderBy('school.name', 'ASC')
            .skip(skip)
            .take(limit);

        const [data, total] = await query.getManyAndCount();

        return { data, total };
    }

    /**
     * Find school by ID
     */
    async findById(id: number): Promise<School | null> {
        return this.schoolRepository.findOne({
            where: { id },
            relations: ['foundation', 'academicYears'],
        });
    }

    /**
     * Find school by code
     */
    async findByCode(code: string): Promise<School | null> {
        return this.schoolRepository.findOne({
            where: { code },
            relations: ['foundation'],
        });
    }

    /**
     * Update school
     */
    async update(id: number, data: UpdateSchoolData): Promise<School | null> {
        const school = await this.schoolRepository.findOne({ where: { id } });

        if (!school) {
            return null;
        }

        Object.assign(school, data);
        return this.schoolRepository.save(school);
    }

    /**
     * Delete school
     */
    async delete(id: number): Promise<boolean> {
        const result = await this.schoolRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}

// Export singleton instance
export const schoolsService = new SchoolsService();
