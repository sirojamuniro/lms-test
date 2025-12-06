import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../plugins/database.plugin';
import { User, UserType } from '../../entities/user.entity';

export interface RegisterUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType?: UserType;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface JwtPayload {
    userId: number;
    email: string;
    userType: string;
    schoolId?: number;
}

/**
 * Authentication service
 */
export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Register a new user
     */
    async register(data: RegisterUserData): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: data.email },
        });

        if (existingUser) {
            const error = new Error('User with this email already exists') as any;
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = this.userRepository.create({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: hashedPassword,
            userType: data.userType || UserType.STUDENT,
        });

        return this.userRepository.save(user);
    }

    /**
     * Validate user credentials
     */
    async validateCredentials(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    /**
     * Find or create user for SSO
     */
    async findOrCreateSsoUser(ssoProvider: string, ssoId: string, userData: {
        email: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    }): Promise<User> {
        // Try to find by SSO ID first
        let user = await this.userRepository.findOne({
            where: { ssoProvider, ssoId },
        });

        if (user) {
            return user;
        }

        // Try to find by email
        user = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (user) {
            // Link existing account to SSO
            user.ssoProvider = ssoProvider;
            user.ssoId = ssoId;
            return this.userRepository.save(user);
        }

        // Create new user
        const newUser = this.userRepository.create({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
            ssoProvider,
            ssoId,
            password: '', // No password for SSO users
            userType: UserType.STUDENT,
        });

        return this.userRepository.save(newUser);
    }

    /**
     * Update refresh token
     */
    async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
        await this.userRepository.update(userId, { refreshToken });
    }

    /**
     * Validate refresh token
     */
    async validateRefreshToken(userId: number, refreshToken: string): Promise<User | null> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.refreshToken')
            .where('user.id = :id', { id: userId })
            .andWhere('user.refreshToken = :refreshToken', { refreshToken })
            .getOne();

        return user;
    }

    /**
     * Change password
     */
    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!user) {
            return false;
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return false;
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(userId, { password: hashedNewPassword });

        return true;
    }

    /**
     * Get user for JWT validation
     */
    async getUserForJwt(userId: number): Promise<JwtPayload | null> {
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true },
            select: ['id', 'email', 'userType', 'primarySchoolId'],
        });

        if (!user) {
            return null;
        }

        return {
            userId: user.id,
            email: user.email,
            userType: user.userType,
            schoolId: user.primarySchoolId,
        };
    }
}

// Export singleton instance
export const authService = new AuthService();
