import { SchoolLevel } from '../../entities/school.entity';

export const createSchoolSchema = {
    description: 'Create school',
    tags: ['Schools'],
    body: {
        type: 'object',
        required: ['name', 'code', 'level'],
        properties: {
            name: { type: 'string' },
            code: { type: 'string' },
            npsn: { type: 'string' },
            level: { type: 'string', enum: Object.values(SchoolLevel) },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            foundationId: { type: 'number' },
        },
    },
};

export const updateSchoolSchema = {
    description: 'Update school',
    tags: ['Schools'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            level: { type: 'string', enum: Object.values(SchoolLevel) },
            address: { type: 'string' },
            npsn: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            isActive: { type: 'boolean' },
            logoUrl: { type: 'string' },
            bannerUrl: { type: 'string' },
            branding: { type: 'object' },
            settings: { type: 'object' },
        },
    },
};

export const listSchoolsSchema = {
    description: 'List schools',
    tags: ['Schools'],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1 },
            search: { type: 'string' },
            isActive: { type: 'boolean' },
            foundationId: { type: 'number' },
        },
    },
};

export const getSchoolSchema = {
    description: 'Get school details',
    tags: ['Schools'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const deleteSchoolSchema = {
    description: 'Delete school',
    tags: ['Schools'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};
