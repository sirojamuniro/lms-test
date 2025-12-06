export const registerSchema = {
    description: 'Register a new user',
    tags: ['Auth'],
    security: [],
    body: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
        },
    },
};

export const loginSchema = {
    description: 'Login with email and password',
    tags: ['Auth'],
    security: [],
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
        },
    },
};

export const refreshTokenSchema = {
    description: 'Refresh access token',
    tags: ['Auth'],
    security: [],
    body: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
            refresh_token: { type: 'string' },
        },
    },
};

export const logoutSchema = {
    description: 'Logout',
    tags: ['Auth'],
};

export const getMeSchema = {
    description: 'Get current user',
    tags: ['Auth'],
};

export const changePasswordSchema = {
    description: 'Change password',
    tags: ['Auth'],
    body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
        },
    },
};
