export const createUserSchema = {
    description: 'Create user',
    tags: ['Admin - Users'],
    body: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName', 'userType'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            userType: { type: 'string' },
            schoolId: { type: 'number' },
        },
    },
};

export const updateUserSchema = {
    description: 'Update user',
    tags: ['Admin - Users'],
    body: {
        type: 'object',
        properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            username: { type: 'string' },
            phone: { type: 'string' },
            bio: { type: 'string' },
            userType: { type: 'string' },
            isActive: { type: 'boolean' },
            schoolId: { type: 'number' },
        },
    },
};

export const listUsersSchema = {
    description: 'List all users',
    tags: ['Admin - Users'],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1 },
            search: { type: 'string' },
            userType: { type: 'string' },
            isActive: { type: 'boolean' },
            schoolId: { type: 'number' },
        },
    },
};

export const getUserSchema = {
    description: 'Get user by ID',
    tags: ['Admin - Users'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const deleteUserSchema = {
    description: 'Delete user',
    tags: ['Admin - Users'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const uploadAvatarSchema = {
    description: 'Upload avatar',
    tags: ['Users'],
};

export const updateProfileSchema = {
    description: 'Update own profile',
    tags: ['Users'],
    body: {
        type: 'object',
        properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            username: { type: 'string' },
            phone: { type: 'string' },
            bio: { type: 'string' },
            // Users cannot update their own userType or schoolId/isActive
        },
    },
};
