import { AppDataSource } from '../../plugins/database.plugin';
import { School, SchoolLevel } from '../../entities/school.entity';
import { Foundation } from '../../entities/foundation.entity';
import { AcademicYear } from '../../entities/academic-year.entity';

export async function seedSchools() {
    console.log('🌱 Seeding Schools...');
    const schoolRepo = AppDataSource.getRepository(School);
    const foundationRepo = AppDataSource.getRepository(Foundation);
    const academicYearRepo = AppDataSource.getRepository(AcademicYear);

    // Create Foundation
    let foundation = await foundationRepo.findOne({ where: { code: 'yayasan-dummy' } });
    if (!foundation) {
        foundation = foundationRepo.create({
            name: 'Yayasan Dummy Indonesia',
            code: 'yayasan-dummy',
            address: 'Jl. Pendidikan No. 1, Jakarta',
            phone: '021-12345678',
            email: 'info@yayasandummy.id',
            website: 'https://yayasandummy.id',
        });
        await foundationRepo.save(foundation);
        console.log('✅ Yayasan created');
    }

    // Create Schools
    const schoolsData = [
        {
            name: 'SMA Dummy 1',
            code: 'SMAD1',
            level: SchoolLevel.SMA,
            address: 'Jl. Sekolah 1',
            phone: '021-11111111',
            email: 'info@smadummy1.sch.id',
            foundationId: foundation.id,
        },
        {
            name: 'SMP Dummy 1',
            code: 'SMPD1',
            level: SchoolLevel.SMP,
            address: 'Jl. Sekolah 2',
            phone: '021-22222222',
            email: 'info@smpdummy1.sch.id',
            foundationId: foundation.id,
        },
    ];

    for (const data of schoolsData) {
        let school = await schoolRepo.findOne({ where: { code: data.code } });
        if (!school) {
            school = schoolRepo.create(data);
            await schoolRepo.save(school);
            console.log(`✅ School ${data.name} created`);
        }

        // Create Academic Year for this school
        let ay = await academicYearRepo.findOne({ where: { name: '2024/2025', schoolId: school.id } });
        if (!ay) {
            ay = academicYearRepo.create({
                name: '2024/2025',
                startDate: new Date('2024-07-01'),
                endDate: new Date('2025-06-30'),
                isActive: true,
                isCurrent: true,
                schoolId: school.id,
            });
            await academicYearRepo.save(ay);
            console.log(`✅ Academic Year created for ${school.name}`);
        }
    }
}
