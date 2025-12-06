import { AppDataSource } from '../../plugins/database.plugin';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { User } from '../../entities/user.entity';
import { Class } from '../../entities/class.entity';

export async function seedAttendance() {
    console.log('🌱 Seeding Attendance...');
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const userRepo = AppDataSource.getRepository(User);
    const classRepo = AppDataSource.getRepository(Class);

    // Get a class
    const cls = await classRepo.findOne({ where: { name: 'X-IPA-1' } });
    if (!cls) return;

    // Get students in this school/class context (mock)
    // For now, get all students and pretend they are in this class
    const students = await userRepo.find({ where: { userType: 'student' as any } });

    // Generate for last 14 days
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (const student of students) {
            const rand = Math.random();
            let status = AttendanceStatus.PRESENT;
            if (rand > 0.9) status = AttendanceStatus.ABSENT;
            else if (rand > 0.8) status = AttendanceStatus.LATE;
            else if (rand > 0.75) status = AttendanceStatus.EXCUSED;

            await attendanceRepo.save(attendanceRepo.create({
                studentId: student.id,
                classId: cls.id,
                date: date,
                status: status,
                checkInTime: '07:00',
                checkOutTime: '14:00',
            }));
        }
    }
}
