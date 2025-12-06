import { AppDataSource } from '../../plugins/database.plugin';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { UserType } from '../../entities/user.entity';

export async function seedRoles() {
    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);
    console.log('🌱 Seeding Roles...');

    // 1. Super Admin Role (Global)
    let superAdminRole = await roleRepository.findOne({ where: { name: 'SUPER_ADMIN' } });
    if (!superAdminRole) {
        superAdminRole = roleRepository.create({
            name: 'SUPER_ADMIN',
            displayName: 'Super Administrator',
            description: 'Full access to the entire system',
            isSystem: true,
            level: 100,
            schoolId: null, // Global
        });

        // Give all permissions
        const allPermissions = await permissionRepository.find();
        superAdminRole.permissions = allPermissions;
        await roleRepository.save(superAdminRole);
    }

    // 2. School Admin Role (Template - can be copied to schools)
    let schoolAdminRole = await roleRepository.findOne({ where: { name: 'SCHOOL_ADMIN' } });
    if (!schoolAdminRole) {
        schoolAdminRole = roleRepository.create({
            name: 'SCHOOL_ADMIN',
            displayName: 'School Administrator',
            description: 'Manages a specific school',
            isSystem: true,
            level: 80,
            schoolId: null, // Global template
        });

        // Give school-level permissions (mock up for now)
        const schoolPermissions = await permissionRepository
            .createQueryBuilder('p')
            .where('p.resource IN (:...resources)', { resources: ['school', 'class', 'course', 'user'] })
            .getMany();

        schoolAdminRole.permissions = schoolPermissions;
        await roleRepository.save(schoolAdminRole);
    }

    // 3. Teacher Role (Global Template)
    let teacherRole = await roleRepository.findOne({ where: { name: 'TEACHER' } });
    if (!teacherRole) {
        teacherRole = roleRepository.create({
            name: 'TEACHER',
            displayName: 'Teacher',
            description: 'Teaches courses and manages classes',
            isSystem: true,
            level: 50,
            schoolId: null,
        });
        await roleRepository.save(teacherRole);
    }

    // 4. Student Role (Global Template)
    let studentRole = await roleRepository.findOne({ where: { name: 'STUDENT' } });
    if (!studentRole) {
        studentRole = roleRepository.create({
            name: 'STUDENT',
            displayName: 'Student',
            description: 'Enrolled in classes and courses',
            isSystem: true,
            level: 10,
            schoolId: null,
        });
        await roleRepository.save(studentRole);
    }

    console.log('✅ Roles seeded');
}
