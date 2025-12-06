import { CourseStatus } from '../../types';

export const createCourseSchema = {
    description: 'Create course',
    tags: ['Courses'],
    body: {
        type: 'object',
        required: ['title'],
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            shortDescription: { type: 'string' },
            thumbnail: { type: 'string' },
            price: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            learningObjectives: { type: 'array', items: { type: 'string' } },
            requirements: { type: 'array', items: { type: 'string' } },
        },
    },
};

export const updateCourseSchema = {
    description: 'Update course',
    tags: ['Courses'],
    body: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            shortDescription: { type: 'string' },
            thumbnail: { type: 'string' },
            status: { type: 'string', enum: Object.values(CourseStatus) },
            price: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            learningObjectives: { type: 'array', items: { type: 'string' } },
            requirements: { type: 'array', items: { type: 'string' } },
        },
    },
};

export const listCoursesSchema = {
    description: 'List courses',
    tags: ['Courses'],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1 },
            search: { type: 'string' },
            status: { type: 'string' },
            instructorId: { type: 'number' },
            schoolId: { type: 'number' },
        },
    },
};

export const getCourseSchema = {
    description: 'Get course by ID',
    tags: ['Courses'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const deleteCourseSchema = {
    description: 'Delete course',
    tags: ['Courses'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const getCourseLessonsSchema = {
    description: 'Get course lessons',
    tags: ['Courses'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};
