import { AppDataSource } from '../../plugins/database.plugin';
import { Course } from '../../entities/course.entity';
import { Lesson } from '../../entities/lesson.entity';
import { User } from '../../entities/user.entity';
import { School } from '../../entities/school.entity';
import { CourseStatus, LessonStatus } from '../../types';

export async function seedCoursesAndLessons() {
    console.log('🌱 Seeding Courses and Lessons...');
    const courseRepo = AppDataSource.getRepository(Course);
    const lessonRepo = AppDataSource.getRepository(Lesson);
    const userRepo = AppDataSource.getRepository(User);
    const schoolRepo = AppDataSource.getRepository(School);

    const instructorSMA = await userRepo.findOne({ where: { email: 'guru.sma@example.com' } });
    const schoolSMA = await schoolRepo.findOne({ where: { code: 'SMAD1' } });

    if (!instructorSMA || !schoolSMA) return;

    const courses = [
        {
            title: 'Matematika Dasar X',
            description: 'Pengantar Matematika untuk kelas 10',
            shortDescription: 'Matematika X',
            price: 0,
            status: CourseStatus.PUBLISHED,
            instructor: instructorSMA,
            school: schoolSMA,
            lessons: [
                { title: 'Logika Matematika', description: 'Dasar logika', order: 1, content: 'Konten logika...', status: LessonStatus.PUBLISHED },
                { title: 'Aljabar', description: 'Dasar aljabar', order: 2, content: 'Konten aljabar...', status: LessonStatus.PUBLISHED },
            ]
        },
        {
            title: 'Fisika Dasar X',
            description: 'Pengantar Fisika untuk kelas 10',
            shortDescription: 'Fisika X',
            price: 50000,
            status: CourseStatus.PUBLISHED,
            instructor: instructorSMA,
            school: schoolSMA,
            lessons: [
                { title: 'Besaran dan Satuan', description: 'Pengenalan besaran', order: 1, content: 'Konten besaran...', status: LessonStatus.PUBLISHED },
                { title: 'Gerak Lurus', description: 'GLB dan GLBB', order: 2, content: 'Konten gerak...', status: LessonStatus.PUBLISHED },
            ]
        }
    ];

    for (const c of courses) {
        let course = await courseRepo.findOne({ where: { title: c.title, school: { id: schoolSMA.id } } });
        if (!course) {
            course = courseRepo.create({
                title: c.title,
                description: c.description,
                shortDescription: c.shortDescription,
                price: c.price,
                status: c.status,
                instructor: c.instructor,
                school: c.school,
            });
            await courseRepo.save(course);
            console.log(`✅ Course ${c.title} created`);

            // Add lessons
            for (const l of c.lessons) {
                const lesson = lessonRepo.create({
                    ...l,
                    courseId: course.id,
                });
                await lessonRepo.save(lesson);
            }
            console.log(`   ✅ ${c.lessons.length} Lessons added`);
        }
    }
}
