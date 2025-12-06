import { AppDataSource } from '../../plugins/database.plugin';
import { User } from '../../entities/user.entity';
import { UserType } from '../../types';
import * as bcrypt from 'bcrypt';
import { School } from '../../entities/school.entity';

export async function seedDummyUsers() {
    console.log('🌱 Seeding Dummy Users...');
    const userRepo = AppDataSource.getRepository(User);
    const schoolRepo = AppDataSource.getRepository(School);

    const schoolSMA = await schoolRepo.findOne({ where: { code: 'SMAD1' } });
    const schoolSMP = await schoolRepo.findOne({ where: { code: 'SMPD1' } });

    if (!schoolSMA || !schoolSMP) {
        console.error('❌ Schools not found, skipping user seeding');
        return;
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    // Instructors
    const instructors = [
        {
            email: 'guru.sma@example.com',
            username: 'gurusma',
            firstName: 'Budi',
            lastName: 'Santoso',
            userType: UserType.TEACHER,
            primarySchoolId: schoolSMA.id,
            nip: '198001012010011001',
        },
        {
            email: 'guru.smp@example.com',
            username: 'gurusmp',
            firstName: 'Siti',
            lastName: 'Aminah',
            userType: UserType.TEACHER,
            primarySchoolId: schoolSMP.id,
            nip: '198502022010012002',
        },
    ];

    for (const data of instructors) {
        const existing = await userRepo.findOne({ where: { email: data.email } });
        if (!existing) {
            const user = userRepo.create({ ...data, password: passwordHash, isActive: true });
            await userRepo.save(user);
            console.log(`✅ Instructor ${data.email} created`);
        }
    }

    // Students
    const students = [];
    for (let i = 1; i <= 5; i++) {
        students.push({
            email: `siswa.sma${i}@example.com`,
            username: `siswasma${i}`,
            firstName: `Siswa SMA`,
            lastName: `${i}`,
            userType: UserType.STUDENT,
            primarySchoolId: schoolSMA.id,
            nis: `SMA2024${i.toString().padStart(3, '0')}`,
        });
        students.push({
            email: `siswa.smp${i}@example.com`,
            username: `siswasmp${i}`,
            firstName: `Siswa SMP`,
            lastName: `${i}`,
            userType: UserType.STUDENT,
            primarySchoolId: schoolSMP.id,
            nis: `SMP2024${i.toString().padStart(3, '0')}`,
        });
    }

    for (const data of students) {
        const existing = await userRepo.findOne({ where: { email: data.email } });
        if (!existing) {
            const user = userRepo.create({ ...data, password: passwordHash, isActive: true });
            await userRepo.save(user);
            // console.log(`✅ Student ${data.email} created`); // Too verbose
        }
    }
    console.log(`✅ ${students.length} Students created`);
}
