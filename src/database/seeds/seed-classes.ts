import { AppDataSource } from '../../plugins/database.plugin';
import { Class } from '../../entities/class.entity';
import { School } from '../../entities/school.entity';
import { User } from '../../entities/user.entity';
import { AcademicYear } from '../../entities/academic-year.entity';

export async function seedClasses() {
    console.log('🌱 Seeding Classes...');
    const classRepo = AppDataSource.getRepository(Class);
    const schoolRepo = AppDataSource.getRepository(School);
    const userRepo = AppDataSource.getRepository(User);
    const academicYearRepo = AppDataSource.getRepository(AcademicYear);

    const ay = await academicYearRepo.findOne({ where: { name: '2024/2025' } });
    if (!ay) {
        console.error('❌ Academic Year not found');
        return;
    }

    const schoolSMA = await schoolRepo.findOne({ where: { code: 'SMAD1' } });
    const teacherSMA = await userRepo.findOne({ where: { email: 'guru.sma@example.com' } });

    if (schoolSMA && teacherSMA) {
        const classesSMA = [
            { name: 'X-IPA-1', grade: '10', major: 'IPA', classNumber: '1' },
            { name: 'XI-IPS-2', grade: '11', major: 'IPS', classNumber: '2' },
        ];

        for (const c of classesSMA) {
            const existing = await classRepo.findOne({
                where: { name: c.name, schoolId: schoolSMA.id, academicYearId: ay.id },
            });
            if (!existing) {
                await classRepo.save(
                    classRepo.create({
                        ...c,
                        school: schoolSMA,
                        academicYear: ay,
                        homeroomTeacher: teacherSMA,
                        capacity: 32,
                    })
                );
                console.log(`✅ Class ${c.name} created`);
            }
        }
    }

    const schoolSMP = await schoolRepo.findOne({ where: { code: 'SMPD1' } });
    const teacherSMP = await userRepo.findOne({ where: { email: 'guru.smp@example.com' } });

    if (schoolSMP && teacherSMP) {
        const classesSMP = [
            { name: 'VII-A', grade: '7', classNumber: 'A' },
            { name: 'VIII-B', grade: '8', classNumber: 'B' },
        ];

        for (const c of classesSMP) {
            const existing = await classRepo.findOne({
                where: { name: c.name, schoolId: schoolSMP.id, academicYearId: ay.id },
            });
            if (!existing) {
                await classRepo.save(
                    classRepo.create({
                        ...c,
                        school: schoolSMP,
                        academicYear: ay,
                        homeroomTeacher: teacherSMP,
                        capacity: 30,
                    })
                );
                console.log(`✅ Class ${c.name} created`);
            }
        }
    }
}
