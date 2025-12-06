export const createQuizSchema = {
    description: 'Create quiz',
    tags: ['Quizzes'],
    body: {
        type: 'object',
        required: ['title'],
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            timeLimit: { type: 'number' },
            maxScore: { type: 'number' },
            maxAttempts: { type: 'number' },
            courseId: { type: 'number' },
            lessonId: { type: 'number' },
        },
    },
};

export const updateQuizSchema = {
    description: 'Update quiz',
    tags: ['Quizzes'],
    body: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            timeLimit: { type: 'number' },
            maxScore: { type: 'number' },
            maxAttempts: { type: 'number' },
        },
    },
};

export const getQuizSchema = {
    description: 'Get quiz by ID',
    tags: ['Quizzes'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const deleteQuizSchema = {
    description: 'Delete quiz',
    tags: ['Quizzes'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const startAttemptSchema = {
    description: 'Start quiz attempt',
    tags: ['Quizzes'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' },
        },
    },
};

export const submitAttemptSchema = {
    description: 'Submit quiz answers',
    tags: ['Quizzes'],
    params: {
        type: 'object',
        required: ['attemptId'],
        properties: {
            attemptId: { type: 'number' },
        },
    },
    body: {
        type: 'object',
        required: ['answers'],
        properties: {
            answers: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['questionId', 'answer'],
                    properties: {
                        questionId: { type: 'number' },
                        answer: { type: ['string', 'number', 'boolean', 'object', 'array'] },
                    },
                },
            },
        },
    },
};

export const getAttemptResultsSchema = {
    description: 'Get attempt results',
    tags: ['Quizzes'],
    params: {
        type: 'object',
        required: ['attemptId'],
        properties: {
            attemptId: { type: 'number' },
        },
    },
};
