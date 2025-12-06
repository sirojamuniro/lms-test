export const createRoleSchema = {
    description: 'Create role',
    tags: ['Roles'],
    body: {
        type: 'object',
        required: ['name', 'displayName'],
        properties: {
            name: { type: 'string' },
            displayName: { type: 'string' },
            description: { type: 'string' },
            schoolId: { type: 'number' },
            permissions: {
                type: 'array',
                items: { type: 'string' }
            },
        },
    },
};

export const updateRoleSchema = {
    description: 'Update role',
    tags: ['Roles'],
    body: {
        type: 'object',
        properties: {
            displayName: { type: 'string' },
            description: { type: 'string' },
            isActive: { type: 'boolean' },
            permissions: {
                type: 'array',
                items: { type: 'string' }
            },
        },
    },
};

export const listRolesSchema = {
    description: 'List roles',
    tags: ['Roles'],
};

export const listPermissionsSchema = {
    description: 'List all permissions',
    tags: ['Roles'],
};

export const deleteRoleSchema = {
    description: 'Delete role',
    tags: ['Roles'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};
