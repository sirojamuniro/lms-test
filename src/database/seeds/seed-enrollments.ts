import { AppDataSource } from '../../plugins/database.plugin';
import { Enrollment } from '../../entities/enrollment.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { EnrollmentStatus } from '../../types';

export async function seedEnrollments() {
    console.log('🌱 Seeding Enrollments...');
    const enrollmentRepo = AppDataSource.getRepository(Enrollment);
    const userRepo = AppDataSource.getRepository(User);
    const courseRepo = AppDataSource.getRepository(Course);

    const students = await userRepo.find({ where: { email: 'siswa.sma1@example.com' } }); // Use find to get array, though finding one is fine. Let's find *like*
    // Actually easier to just get the specific ones we created
    const student1 = await userRepo.findOne({ where: { email: 'siswa.sma1@example.com' } });
    const student2 = await userRepo.findOne({ where: { email: 'siswa.sma2@example.com' } });

    if (!student1 || !student2) return;

    const courses = await courseRepo.find();
    if (courses.length === 0) return;

    // Enroll student 1 in all courses
    for (const course of courses) {
        const existing = await enrollmentRepo.findOne({ where: { studentId: student1.id, courseId: course.id } });
        if (!existing) {
            await enrollmentRepo.save(enrollmentRepo.create({
                student: student1,
                course: course,
                status: EnrollmentStatus.ACTIVE,
                enrolledAt: new Date(),
            }));
            console.log(`✅ Student ${student1.email} enrolled in ${course.title}`);
        }
    }

    // Enroll student 2 in first course only
    if (courses[0]) {
        const existing = await enrollmentRepo.findOne({ where: { studentId: student2.id, courseId: courses[0].id } });
        if (!existing) {
            await enrollmentRepo.save(enrollmentRepo.create({
                student: student2,
                course: courses[0],
                status: EnrollmentStatus.ACTIVE,
                enrolledAt: new Date(),
            }));
            console.log(`✅ Student ${student2.email} enrolled in ${courses[0].title}`);
        }
    }
}
