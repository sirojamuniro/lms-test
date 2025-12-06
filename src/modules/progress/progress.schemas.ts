import { ProgressStatus } from '../../types';

export const updateProgressSchema = {
    description: 'Update lesson progress',
    tags: ['Progress'],
    body: {
        type: 'object',
        properties: {
            status: { type: 'string', enum: Object.values(ProgressStatus) },
            completionPercentage: { type: 'number', minimum: 0, maximum: 100 },
            timeSpent: { type: 'number' },
        },
    },
};

export const getLessonProgressSchema = {
    description: 'Get lesson progress',
    tags: ['Progress'],
    params: {
        type: 'object',
        required: ['lessonId'],
        properties: {
            lessonId: { type: 'number' },
        },
    },
};

export const markLessonCompleteSchema = {
    description: 'Mark lesson complete',
    tags: ['Progress'],
    params: {
        type: 'object',
        required: ['lessonId'],
        properties: {
            lessonId: { type: 'number' },
        },
    },
};

export const getCourseProgressSchema = {
    description: 'Get course progress',
    tags: ['Progress'],
    params: {
        type: 'object',
        required: ['courseId'],
        properties: {
            courseId: { type: 'number' },
        },
    },
};
