import { AppDataSource } from '../../plugins/database.plugin';
import { Subject } from '../../entities/subject.entity';
import { Class } from '../../entities/class.entity';
import { User, UserType } from '../../entities/user.entity';

export async function seedSubjects() {
    console.log('🌱 Seeding Subjects...');
    const subjectRepo = AppDataSource.getRepository(Subject);
    const classRepo = AppDataSource.getRepository(Class);
    const userRepo = AppDataSource.getRepository(User);

    const classes = await classRepo.find({ relations: ['school'] });
    const teacher = await userRepo.findOne({ where: { userType: 'teacher' as any } }); // Use string literal to avoid enum mismatch issues if any

    if (!teacher) {
        console.warn('⚠️ No teacher found for subjects, skipping...');
        return;
    }

    const subjectsList = [
        { name: 'Matematika', code: 'MTK', creditHours: 4 },
        { name: 'Bahasa Indonesia', code: 'IND', creditHours: 2 },
        { name: 'Bahasa Inggris', code: 'ING', creditHours: 2 },
        { name: 'Fisika', code: 'FIS', creditHours: 3 },
    ];

    for (const cls of classes) {
        for (const sub of subjectsList) {
            // Unique index is [classId, code]
            const existing = await subjectRepo.findOne({
                where: { classId: cls.id, code: sub.code }
            });

            if (!existing) {
                await subjectRepo.save(subjectRepo.create({
                    ...sub,
                    class: cls,
                    teacher: teacher,
                    isActive: true,
                    description: `Mata Pelajaran ${sub.name} untuk kelas ${cls.name}`
                }));
            }
        }
    }
    console.log(`✅ Subjects created for ${classes.length} classes`);
}
