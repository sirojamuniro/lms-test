import { AppDataSource } from '../../plugins/database.plugin';
import { User } from '../../entities/user.entity';
import { Grade, GradeType } from '../../entities/grade.entity';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { AcademicYear } from '../../entities/academic-year.entity';
import { ResponseHelper } from '../../helpers/response.helper';
import { Between } from 'typeorm';

export class ReportsService {
    private userRepo = AppDataSource.getRepository(User);
    private gradeRepo = AppDataSource.getRepository(Grade);
    private attendanceRepo = AppDataSource.getRepository(Attendance);
    private academicYearRepo = AppDataSource.getRepository(AcademicYear);

    async getStudentSemesterReport(studentId: number, semester: number, academicYearId?: number) {
        // 1. Get Student Info
        const student = await this.userRepo.findOne({
            where: { id: studentId },
            relations: ['class', 'class.academicYear']
        });

        if (!student) {
            throw { statusCode: 404, message: 'Student not found' };
        }

        const ayId = academicYearId || student.class?.academicYearId;
        if (!ayId) {
            throw { statusCode: 400, message: 'Academic Year unknown' };
        }

        const academicYear = await this.academicYearRepo.findOne({ where: { id: ayId } });
        if (!academicYear) throw { statusCode: 404, message: 'Academic Year not found' };

        // Determine Semester Dates (Mock logic, ideally stored in AcademicYear)
        // Adjust these dates based on your actual data or AY logic
        const semesterStart = semester === 1 ? new Date(academicYear.startDate) : new Date(new Date(academicYear.startDate).setMonth(new Date(academicYear.startDate).getMonth() + 6));
        const semesterEnd = semester === 1 ? new Date(new Date(academicYear.startDate).setMonth(new Date(academicYear.startDate).getMonth() + 6)) : new Date(academicYear.endDate);


        // 2. Attendance Summary
        const attendanceRecords = await this.attendanceRepo.find({
            where: {
                studentId,
                date: Between(semesterStart, semesterEnd)
            }
        });

        const attendanceSummary = {
            totalDays: attendanceRecords.length,
            present: attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length,
            absent: attendanceRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
            late: attendanceRecords.filter(r => r.status === AttendanceStatus.LATE).length,
            excused: attendanceRecords.filter(r => r.status === AttendanceStatus.EXCUSED).length,
            sick: attendanceRecords.filter(r => r.status === AttendanceStatus.SICK).length,
            percentage: attendanceRecords.length > 0
                ? ((attendanceRecords.filter(r => [AttendanceStatus.PRESENT, AttendanceStatus.LATE].includes(r.status)).length) / attendanceRecords.length) * 100
                : 0
        };

        // 3. Grades Aggregation
        const grades = await this.gradeRepo.find({
            where: { studentId, semester },
            relations: ['subject']
        });

        // Group by Subject
        const subjectGrades: any = {};

        for (const grade of grades) {
            const subjectId = grade.subjectId;
            const subjectName = grade.subject.name;

            if (!subjectGrades[subjectId]) {
                subjectGrades[subjectId] = {
                    subjectId,
                    subjectName,
                    grades: [],
                    academicScore: 0, // 60%
                    examScore: 0,     // 40%
                    finalScore: 0,
                    letterGrade: '',
                };
            }
            subjectGrades[subjectId].grades.push(grade);
        }

        // Calculate Scores
        const reportCard = Object.values(subjectGrades).map((subject: any) => {
            const academicGrades = subject.grades.filter((g: Grade) =>
                [GradeType.DAILY, GradeType.ASSIGNMENT, GradeType.QUIZ, GradeType.PROJECT, GradeType.PRACTICAL].includes(g.gradeType)
            );

            const examGrades = subject.grades.filter((g: Grade) =>
                [GradeType.MIDTERM, GradeType.FINAL].includes(g.gradeType)
            );

            // Simple average for sub-components (can be advanced with weights)
            const academicAvg = this.calculateAverage(academicGrades);
            const examAvg = this.calculateAverage(examGrades);

            // Final Calculation: 60% Academic + 40% Exam
            // Handle case where exams might not exist yet
            let finalScore = 0;
            if (academicGrades.length > 0 && examGrades.length > 0) {
                finalScore = (academicAvg * 0.6) + (examAvg * 0.4);
            } else if (academicGrades.length > 0) {
                finalScore = academicAvg;
            } else if (examGrades.length > 0) {
                finalScore = examAvg;
            }

            return {
                subjectId: subject.subjectId,
                subject: subject.subjectName,
                academicScore: parseFloat(academicAvg.toFixed(2)),
                examScore: parseFloat(examAvg.toFixed(2)),
                finalScore: parseFloat(finalScore.toFixed(2)),
                grade: this.getLetterGrade(finalScore),
                details: {
                    daily: academicGrades.length,
                    exams: examGrades.length
                }
            };
        });

        return {
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                nis: student.nis,
                class: student.class?.name,
                admissionScore: student.admissionScore,
            },
            semester,
            academicYear: academicYear.name,
            attendance: {
                ...attendanceSummary,
                percentage: parseFloat(attendanceSummary.percentage.toFixed(2))
            },
            subjects: reportCard,
            overallAverage: parseFloat((reportCard.reduce((sum: number, s: any) => sum + s.finalScore, 0) / (reportCard.length || 1)).toFixed(2))
        };
    }

    private calculateAverage(grades: Grade[]): number {
        if (grades.length === 0) return 0;
        const sum = grades.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
        return sum / grades.length;
    }

    private getLetterGrade(score: number): string {
        if (score >= 85) return 'A';
        if (score >= 75) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'E';
    }
}

export const reportsService = new ReportsService();
