import { AppDataSource } from '../../plugins/database.plugin';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { Class } from '../../entities/class.entity';
import { User } from '../../entities/user.entity';
import { ResponseHelper } from '../../helpers/response.helper';
import { Between } from 'typeorm';

export class AttendanceService {
    private attendanceRepo = AppDataSource.getRepository(Attendance);
    private classRepo = AppDataSource.getRepository(Class);
    private userRepo = AppDataSource.getRepository(User);

    async createBulk(data: any, recordedById: number) {
        const { classId, date, attendances, subjectId } = data;

        const classEntity = await this.classRepo.findOne({ where: { id: classId } });
        if (!classEntity) {
            throw { statusCode: 404, message: 'Class not found' };
        }

        const results = [];
        for (const item of attendances) {
            // Check if student exists
            const student = await this.userRepo.findOne({ where: { id: item.studentId } });
            if (!student) continue;

            // Check if already exists for this date/student/class/(subject)
            const query: any = {
                studentId: item.studentId,
                classId,
                date: new Date(date),
            };
            if (subjectId) query.subjectId = subjectId;

            let attendance = await this.attendanceRepo.findOne({ where: query });

            if (attendance) {
                // Update existing
                Object.assign(attendance, item);
                attendance.recordedById = recordedById;
            } else {
                // Create new
                attendance = this.attendanceRepo.create({
                    ...item,
                    classId,
                    date: new Date(date),
                    subjectId,
                    recordedById,
                });
            }
            results.push(await this.attendanceRepo.save(attendance));
        }

        return results;
    }

    async findAll(query: any) {
        const { page = 1, limit = 10, startDate, endDate, ...filters } = query;
        const where: any = { ...filters };

        if (startDate && endDate) {
            where.date = Between(startDate, endDate);
        } else if (filters.date) {
            where.date = new Date(filters.date);
        }

        const [data, total] = await this.attendanceRepo.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            relations: ['student', 'class', 'subject'],
            order: { date: 'DESC' },
        });

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: number) {
        const attendance = await this.attendanceRepo.findOne({
            where: { id },
            relations: ['student', 'class', 'subject', 'recordedBy'],
        });
        if (!attendance) {
            throw { statusCode: 404, message: 'Attendance record not found' };
        }
        return attendance;
    }

    async update(id: number, data: Partial<Attendance>) {
        const attendance = await this.findOne(id);
        Object.assign(attendance, data);
        return await this.attendanceRepo.save(attendance);
    }

    async delete(id: number) {
        const attendance = await this.findOne(id);
        return await this.attendanceRepo.remove(attendance);
    }

    async getStudentSummary(studentId: number, semesterStart: Date, semesterEnd: Date) {
        const records = await this.attendanceRepo.find({
            where: {
                studentId,
                date: Between(semesterStart, semesterEnd)
            }
        });

        const total = records.length;
        const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const late = records.filter(r => r.status === AttendanceStatus.LATE).length;
        const excused = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;
        const sick = records.filter(r => r.status === AttendanceStatus.SICK).length;

        const percentage = total > 0 ? ((present + late) / total) * 100 : 0;

        return {
            total,
            present,
            absent,
            late,
            excused,
            sick,
            percentage
        };
    }
}

export const attendanceService = new AttendanceService();
