import { AppDataSource } from '../../plugins/database.plugin';
import { User, UserType } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedUsers() {
    const userRepository = AppDataSource.getRepository(User);
    console.log('🌱 Seeding Users...');

    // Create Super Admin
    const adminEmail = 'admin@example.com';
    let admin = await userRepository.findOne({ where: { email: adminEmail } });

    if (!admin) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        admin = userRepository.create({
            email: adminEmail,
            username: 'superadmin',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            userType: UserType.SUPER_ADMIN,
            isActive: true,
        });
        await userRepository.save(admin);
        console.log('✅ Super Admin created: admin@example.com / password123');
    }

    console.log('✅ Users seeded');
}
