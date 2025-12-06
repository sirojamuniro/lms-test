import { AppDataSource } from '../../plugins/database.plugin';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';

export interface CreateRoleData {
    name: string;
    displayName: string;
    description?: string;
    schoolId?: number;
    permissions?: string[]; // Array of permission names (e.g., 'user:create')
}

export interface UpdateRoleData {
    displayName?: string;
    description?: string;
    isActive?: boolean;
    permissions?: string[];
}

/**
 * Roles service
 */
export class RolesService {
    private roleRepository = AppDataSource.getRepository(Role);
    private permissionRepository = AppDataSource.getRepository(Permission);

    /**
     * Create a new role
     */
    async create(data: CreateRoleData): Promise<Role> {
        const existingRole = await this.roleRepository.findOne({
            where: { name: data.name, schoolId: data.schoolId },
        });

        if (existingRole) {
            const error = new Error('Role with this name already exists in this school') as any;
            error.statusCode = 409;
            throw error;
        }

        const role = this.roleRepository.create({
            name: data.name,
            displayName: data.displayName,
            description: data.description,
            schoolId: data.schoolId,
        });

        if (data.permissions && data.permissions.length > 0) {
            const permissions = await this.permissionRepository
                .createQueryBuilder('permission')
                .where('permission.name IN (:...names)', { names: data.permissions })
                .getMany();
            role.permissions = permissions;
        }

        return this.roleRepository.save(role);
    }

    /**
     * Find all roles
     */
    async findAll(schoolId?: number): Promise<Role[]> {
        const query = this.roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permissions');

        if (schoolId) {
            query.where('role.schoolId = :schoolId OR role.schoolId IS NULL', { schoolId });
        } else {
            query.where('role.schoolId IS NULL'); // Global roles only if no schoolId provided
        }

        return query.getMany();
    }

    /**
     * Find role by ID
     */
    async findById(id: number): Promise<Role | null> {
        return this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
    }

    /**
     * Update role
     */
    async update(id: number, data: UpdateRoleData): Promise<Role | null> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });

        if (!role) {
            return null;
        }

        if (data.displayName) role.displayName = data.displayName;
        if (data.description) role.description = data.description;
        if (data.isActive !== undefined) role.isActive = data.isActive;

        if (data.permissions) {
            const permissions = await this.permissionRepository
                .createQueryBuilder('permission')
                .where('permission.name IN (:...names)', { names: data.permissions })
                .getMany();
            role.permissions = permissions;
        }

        return this.roleRepository.save(role);
    }

    /**
     * Delete role
     */
    async delete(id: number): Promise<boolean> {
        const role = await this.roleRepository.findOne({ where: { id } });

        if (!role) return false;

        // Prevent deleting system roles
        if (role.isSystem) {
            const error = new Error('Cannot delete system role') as any;
            error.statusCode = 403;
            throw error;
        }

        await this.roleRepository.remove(role);
        return true;
    }

    /**
     * Get all permissions
     */
    async getAllPermissions(): Promise<Permission[]> {
        return this.permissionRepository.find({ order: { module: 'ASC', name: 'ASC' } });
    }
}

// Export singleton instance
export const rolesService = new RolesService();
