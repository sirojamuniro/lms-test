import { AppDataSource } from '../../plugins/database.plugin';
import { Grade, GradeType } from '../../entities/grade.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { Enrollment } from '../../entities/enrollment.entity';

export async function seedGrades() {
    console.log('🌱 Seeding Grades...');
    const gradeRepo = AppDataSource.getRepository(Grade);
    const enrollmentRepo = AppDataSource.getRepository(Enrollment);
    const userRepo = AppDataSource.getRepository(User);

    const students = await userRepo.find({ where: { userType: 'student' as any } });
    if (students.length === 0) return;

    // Get Enrollments to know which courses student is in
    const enrollments = await enrollmentRepo.find({ relations: ['course'] });

    for (const enrollment of enrollments) {
        // Assume courses are mapped to subjects. For simplicity in seed, let's just use course ID as subject ID mock
        // In real app, Course -> Subject relation needed.
        // Let's create dummy grades for this "course/subject"

        // Fetch a real subject for this student's class (if available) or any subject
        // For simplicity, find the first subject
        const subject = await AppDataSource.getRepository('Subject').findOne({ where: {} }) as any;
        if (!subject) continue;
        const subjectId = subject.id;

        // 1. Daily Grades (3 items)
        for (let i = 1; i <= 3; i++) {
            await gradeRepo.save(gradeRepo.create({
                studentId: enrollment.studentId,
                subjectId: subjectId, // Mock subject
                gradeType: GradeType.DAILY,
                score: 70 + Math.floor(Math.random() * 30),
                title: `Daily Task ${i}`,
                semester: 1,
                gradedAt: new Date(),
            }));
        }

        // 2. Midterm
        await gradeRepo.save(gradeRepo.create({
            studentId: enrollment.studentId,
            subjectId: subjectId,
            gradeType: GradeType.MIDTERM,
            score: 60 + Math.floor(Math.random() * 40),
            title: `Midterm Exam`,
            semester: 1,
            gradedAt: new Date(),
        }));

        // 3. Final
        await gradeRepo.save(gradeRepo.create({
            studentId: enrollment.studentId,
            subjectId: subjectId,
            gradeType: GradeType.FINAL,
            score: 65 + Math.floor(Math.random() * 35),
            title: `Final Exam`,
            semester: 1,
            gradedAt: new Date(),
        }));
    }

    // Set admission score for students
    for (const student of students) {
        student.admissionScore = 80 + Math.floor(Math.random() * 20);
        await userRepo.save(student);
    }
}
