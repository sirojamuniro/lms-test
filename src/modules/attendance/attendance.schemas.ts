import { AttendanceStatus } from '../../entities/attendance.entity';

export const createAttendanceSchema = {
    type: 'object',
    required: ['classId', 'date', 'attendances'],
    properties: {
        classId: { type: 'number' },
        subjectId: { type: 'number', nullable: true }, // Optional, if per-subject attendance
        date: { type: 'string', format: 'date' },
        attendances: {
            type: 'array',
            items: {
                type: 'object',
                required: ['studentId', 'status'],
                properties: {
                    studentId: { type: 'number' },
                    status: { type: 'string', enum: Object.values(AttendanceStatus) },
                    notes: { type: 'string', nullable: true },
                    checkInTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', nullable: true }, // HH:mm
                    checkOutTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', nullable: true }, // HH:mm
                },
            },
        },
    },
};

export const updateAttendanceSchema = {
    type: 'object',
    properties: {
        status: { type: 'string', enum: Object.values(AttendanceStatus) },
        notes: { type: 'string', nullable: true },
        checkInTime: { type: 'string', nullable: true },
        checkOutTime: { type: 'string', nullable: true },
    },
};

export const listAttendanceQuerySchema = {
    type: 'object',
    properties: {
        classId: { type: 'number' },
        studentId: { type: 'number' },
        date: { type: 'string', format: 'date' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        page: { type: 'number', default: 1 },
        limit: { type: 'number', default: 10 },
    },
};
