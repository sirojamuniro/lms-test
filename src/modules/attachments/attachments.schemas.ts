export const uploadAttachmentSchema = {
    description: 'Upload file',
    tags: ['Attachments'],
    consumes: ['multipart/form-data'],
};

export const listAttachmentsSchema = {
    description: 'List attachments',
    tags: ['Attachments'],
    querystring: {
        type: 'object',
        properties: {
            entityType: { type: 'string' },
            entityId: { type: 'number' },
        },
    },
};

export const getAttachmentSchema = {
    description: 'Get attachment',
    tags: ['Attachments'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const downloadAttachmentSchema = {
    description: 'Download file',
    tags: ['Attachments'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const deleteAttachmentSchema = {
    description: 'Delete attachment',
    tags: ['Attachments'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};
