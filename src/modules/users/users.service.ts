import { AppDataSource } from '../../plugins/database.plugin';
import { User, UserType } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string;
    phone?: string;
    userType?: UserType;
    bio?: string;
    schoolId?: number;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    isActive?: boolean;
    userType?: UserType;
    primarySchoolId?: number;
}

export interface UserFilterOptions {
    userType?: UserType;
    schoolId?: number;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Users service
 */
export class UsersService {
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Create a new user
     */
    async create(data: CreateUserData): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: data.email },
        });

        if (existingUser) {
            const error = new Error('User with this email already exists') as any;
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = this.userRepository.create({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            phone: data.phone,
            bio: data.bio,
            password: hashedPassword,
            userType: data.userType || UserType.STUDENT,
            primarySchoolId: data.schoolId,
        });

        return this.userRepository.save(user);
    }

    /**
     * Find all users with filters
     */
    async findAll(options: UserFilterOptions = {}): Promise<{ data: User[]; total: number }> {
        const { userType, schoolId, isActive, search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const query = this.userRepository.createQueryBuilder('user')
            .select([
                'user.id',
                'user.email',
                'user.username',
                'user.firstName',
                'user.lastName',
                'user.phone',
                'user.avatar',
                'user.userType',
                'user.isActive',
                'user.primarySchoolId',
                'user.createdAt',
                'user.updatedAt',
            ]);

        if (userType) {
            query.andWhere('user.userType = :userType', { userType });
        }

        if (schoolId) {
            query.andWhere('user.primarySchoolId = :schoolId', { schoolId });
        }

        if (isActive !== undefined) {
            query.andWhere('user.isActive = :isActive', { isActive });
        }

        if (search) {
            query.andWhere(
                '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        query.orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limit);

        const [data, total] = await query.getManyAndCount();

        return { data, total };
    }

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id },
            select: [
                'id', 'email', 'username', 'firstName', 'lastName',
                'phone', 'avatar', 'userType', 'isActive', 'bio',
                'primarySchoolId', 'createdAt', 'updatedAt'
            ],
        });
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    /**
     * Update user
     */
    async update(id: number, data: UpdateUserData): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            return null;
        }

        Object.assign(user, data);
        return this.userRepository.save(user);
    }

    /**
     * Delete user
     */
    async delete(id: number): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * Update avatar
     */
    async updateAvatar(id: number, avatarPath: string): Promise<User | null> {
        await this.userRepository.update(id, { avatar: avatarPath });
        return this.findById(id);
    }

    /**
     * Get user statistics
     */
    async getStats(): Promise<{
        total: number;
        byUserType: Record<string, number>;
        active: number;
        inactive: number;
    }> {
        const [total, active, userTypeStats] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { isActive: true } }),
            this.userRepository
                .createQueryBuilder('user')
                .select('user.userType', 'userType')
                .addSelect('COUNT(*)', 'count')
                .groupBy('user.userType')
                .getRawMany(),
        ]);

        const inactive = total - active;
        const byUserType: Record<string, number> = {};
        userTypeStats.forEach((stat) => {
            byUserType[stat.userType] = parseInt(stat.count, 10);
        });

        return { total, byUserType, active, inactive };
    }
}

// Export singleton instance
export const usersService = new UsersService();
