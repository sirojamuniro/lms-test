import { LessonStatus } from '../../types';

export const createLessonSchema = {
    description: 'Create lesson',
    tags: ['Lessons'],
    body: {
        type: 'object',
        required: ['title', 'courseId'],
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            content: { type: 'string' },
            courseId: { type: 'number' },
            order: { type: 'number' },
            duration: { type: 'number' },
            videoUrl: { type: 'string' },
        },
    },
};

export const updateLessonSchema = {
    description: 'Update lesson',
    tags: ['Lessons'],
    body: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            content: { type: 'string' },
            order: { type: 'number' },
            duration: { type: 'number' },
            status: { type: 'string', enum: Object.values(LessonStatus) },
            videoUrl: { type: 'string' },
        },
    },
};

export const getLessonSchema = {
    description: 'Get lesson by ID',
    tags: ['Lessons'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const deleteLessonSchema = {
    description: 'Delete lesson',
    tags: ['Lessons'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const reorderLessonsSchema = {
    description: 'Reorder lessons',
    tags: ['Lessons'],
    body: {
        type: 'object',
        required: ['courseId', 'orders'],
        properties: {
            courseId: { type: 'number' },
            orders: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'order'],
                    properties: {
                        id: { type: 'number' },
                        order: { type: 'number' },
                    },
                },
            },
        },
    },
};
