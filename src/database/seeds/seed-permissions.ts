import { AppDataSource } from '../../plugins/database.plugin';
import { Permission } from '../../entities/permission.entity';

export const permissionsData = [
    // Users
    { name: 'user:create', resource: 'user', action: 'create', description: 'Create new users' },
    { name: 'user:read', resource: 'user', action: 'read', description: 'View user details' },
    { name: 'user:update', resource: 'user', action: 'update', description: 'Update user details' },
    { name: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' },

    // Roles
    { name: 'role:create', resource: 'role', action: 'create', description: 'Create new roles' },
    { name: 'role:read', resource: 'role', action: 'read', description: 'View roles' },
    { name: 'role:update', resource: 'role', action: 'update', description: 'Update roles' },
    { name: 'role:delete', resource: 'role', action: 'delete', description: 'Delete roles' },

    // Schools
    { name: 'school:create', resource: 'school', action: 'create', description: 'Create new schools' },
    { name: 'school:read', resource: 'school', action: 'read', description: 'View schools' },
    { name: 'school:update', resource: 'school', action: 'update', description: 'Update schools' },
    { name: 'school:delete', resource: 'school', action: 'delete', description: 'Delete schools' },

    // Classes
    { name: 'class:create', resource: 'class', action: 'create', description: 'Create new classes' },
    { name: 'class:read', resource: 'class', action: 'read', description: 'View classes' },
    { name: 'class:update', resource: 'class', action: 'update', description: 'Update classes' },
    { name: 'class:delete', resource: 'class', action: 'delete', description: 'Delete classes' },

    // Courses
    { name: 'course:create', resource: 'course', action: 'create', description: 'Create new courses' },
    { name: 'course:read', resource: 'course', action: 'read', description: 'View courses' },
    { name: 'course:update', resource: 'course', action: 'update', description: 'Update courses' },
    { name: 'course:delete', resource: 'course', action: 'delete', description: 'Delete courses' },
];

export async function seedPermissions() {
    const repository = AppDataSource.getRepository(Permission);
    console.log('🌱 Seeding Permissions...');

    for (const perm of permissionsData) {
        const existing = await repository.findOne({ where: { name: perm.name } });
        if (!existing) {
            await repository.save(repository.create(perm));
        }
    }
    console.log('✅ Permissions seeded');
}
