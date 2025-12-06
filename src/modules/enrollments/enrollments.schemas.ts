import { EnrollmentStatus } from '../../types';

export const enrollSchema = {
    description: 'Enroll in course',
    tags: ['Enrollments'],
    body: {
        type: 'object',
        required: ['courseId'],
        properties: {
            courseId: { type: 'number' },
            pricePaid: { type: 'number' },
        },
    },
};

export const updateEnrollmentStatusSchema = {
    description: 'Update enrollment status',
    tags: ['Enrollments'],
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: { type: 'string', enum: Object.values(EnrollmentStatus) },
        },
    },
};

export const checkEnrollmentSchema = {
    description: 'Check if enrolled',
    tags: ['Enrollments'],
    params: {
        type: 'object',
        required: ['courseId'],
        properties: {
            courseId: { type: 'number' },
        },
    },
};

export const getCourseEnrollmentsSchema = {
    description: 'Get course enrollments',
    tags: ['Enrollments'],
    params: {
        type: 'object',
        required: ['courseId'],
        properties: {
            courseId: { type: 'number' },
        },
    },
};

export const unenrollSchema = {
    description: 'Unenroll',
    tags: ['Enrollments'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};
