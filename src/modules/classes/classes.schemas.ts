export const createClassSchema = {
    description: 'Create class',
    tags: ['Classes'],
    body: {
        type: 'object',
        required: ['name', 'grade', 'schoolId', 'academicYearId'],
        properties: {
            name: { type: 'string' },
            grade: { type: 'string' },
            major: { type: 'string' },
            classNumber: { type: 'string' },
            capacity: { type: 'number' },
            room: { type: 'string' },
            schoolId: { type: 'number' },
            academicYearId: { type: 'number' },
            homeroomTeacherId: { type: 'number' },
        },
    },
};

export const updateClassSchema = {
    description: 'Update class',
    tags: ['Classes'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            capacity: { type: 'number' },
            room: { type: 'string' },
            isActive: { type: 'boolean' },
            homeroomTeacherId: { type: 'number' },
            settings: { type: 'object' },
        },
    },
};

export const listClassesSchema = {
    description: 'List classes',
    tags: ['Classes'],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1 },
            search: { type: 'string' },
            grade: { type: 'string' },
            isActive: { type: 'boolean' },
            schoolId: { type: 'number' },
            academicYearId: { type: 'number' },
        },
    },
};

export const getClassSchema = {
    description: 'Get class details',
    tags: ['Classes'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const deleteClassSchema = {
    description: 'Delete class',
    tags: ['Classes'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const manageStudentClassSchema = {
    description: 'Add/Remove student to/from class',
    tags: ['Classes'],
    params: {
        type: 'object',
        required: ['id', 'studentId'],
        properties: {
            id: { type: 'number' },
            studentId: { type: 'number' },
        },
    },
};
