import { AppDataSource } from '../../plugins/database.plugin';
import { Grade, GradeType } from '../../entities/grade.entity';
import { User } from '../../entities/user.entity';
import { Subject } from '../../entities/subject.entity';
import { ResponseHelper } from '../../helpers/response.helper';

export class GradesService {
    private gradeRepo = AppDataSource.getRepository(Grade);
    private userRepo = AppDataSource.getRepository(User);
    private subjectRepo = AppDataSource.getRepository(Subject);

    async create(data: Partial<Grade>) {
        const student = await this.userRepo.findOne({ where: { id: data.studentId } });
        if (!student) {
            throw { statusCode: 404, message: 'Student not found' };
        }

        const subject = await this.subjectRepo.findOne({ where: { id: data.subjectId } });
        if (!subject) {
            throw { statusCode: 404, message: 'Subject not found' };
        }

        const grade = this.gradeRepo.create(data);
        return await this.gradeRepo.save(grade);
    }

    async findAll(query: any) {
        const { page = 1, limit = 10, ...filters } = query;
        const [data, total] = await this.gradeRepo.findAndCount({
            where: filters,
            skip: (page - 1) * limit,
            take: limit,
            relations: ['student', 'subject', 'gradedBy'],
            order: { createdAt: 'DESC' },
        });

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: number) {
        const grade = await this.gradeRepo.findOne({
            where: { id },
            relations: ['student', 'subject', 'gradedBy'],
        });
        if (!grade) {
            throw { statusCode: 404, message: 'Grade not found' };
        }
        return grade;
    }

    async update(id: number, data: Partial<Grade>) {
        const grade = await this.findOne(id);
        Object.assign(grade, data);
        return await this.gradeRepo.save(grade);
    }

    async delete(id: number) {
        const grade = await this.findOne(id);
        return await this.gradeRepo.remove(grade);
    }

    async getStudentReport(studentId: number, semester: number) {
        const grades = await this.gradeRepo.find({
            where: { studentId, semester },
            relations: ['subject'],
        });
        return grades;
    }
}

export const gradesService = new GradesService();
