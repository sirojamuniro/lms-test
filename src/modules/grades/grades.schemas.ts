import { GradeType } from '../../entities/grade.entity';

export const createGradeSchema = {
    type: 'object',
    required: ['studentId', 'subjectId', 'gradeType', 'score'],
    properties: {
        studentId: { type: 'number' },
        subjectId: { type: 'number' },
        gradeType: { type: 'string', enum: Object.values(GradeType) },
        score: { type: 'number', minimum: 0, maximum: 100 },
        maxScore: { type: 'number', default: 100 },
        title: { type: 'string' },
        notes: { type: 'string' },
        kdCode: { type: 'string' },
        weight: { type: 'number', minimum: 0, maximum: 1 },
        semester: { type: 'number', enum: [1, 2] },
        gradedAt: { type: 'string', format: 'date' },
    },
};

export const updateGradeSchema = {
    type: 'object',
    properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        maxScore: { type: 'number' },
        title: { type: 'string' },
        notes: { type: 'string' },
        kdCode: { type: 'string' },
        weight: { type: 'number' },
        semester: { type: 'number' },
        gradedAt: { type: 'string', format: 'date' },
    },
};

export const listGradesQuerySchema = {
    type: 'object',
    properties: {
        studentId: { type: 'number' },
        subjectId: { type: 'number' },
        gradeType: { type: 'string', enum: Object.values(GradeType) },
        semester: { type: 'number' },
        page: { type: 'number', default: 1 },
        limit: { type: 'number', default: 10 },
    },
};
