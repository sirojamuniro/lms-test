import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

/**
 * Register Swagger documentation plugin
 */
export async function registerSwaggerPlugin(server: FastifyInstance) {
    // Register Swagger (OpenAPI)
    await server.register(swagger, {
        openapi: {
            openapi: '3.0.3',
            info: {
                title: 'LMS Genius API',
                description: 'Learning Management System API - Built with Fastify, TypeORM, JWT Authentication',
                version: '2.0.0',
                contact: {
                    name: 'API Support',
                    email: 'support@lms-genius.com',
                },
                license: {
                    name: 'MIT',
                    url: 'https://opensource.org/licenses/MIT',
                },
            },
            servers: [
                {
                    url: `http://localhost:${process.env.PORT || 3000}`,
                    description: 'Development server',
                },
                {
                    url: process.env.API_URL || 'https://api.lms-genius.com',
                    description: 'Production server',
                },
            ],
            tags: [
                { name: 'Health', description: 'Health check endpoints' },
                { name: 'Auth', description: 'Authentication & Authorization' },
                { name: 'Users', description: 'User management' },
                { name: 'Courses', description: 'Course management' },
                { name: 'Lessons', description: 'Lesson management' },
                { name: 'Enrollments', description: 'Course enrollments' },
                { name: 'Attachments', description: 'File attachments' },
                { name: 'Progress', description: 'Learning progress tracking' },
                { name: 'Quizzes', description: 'Quiz management' },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Enter your JWT token',
                    },
                },
            },
            security: [{ bearerAuth: [] }],
        },
    });

    // Register Swagger UI
    await server.register(swaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            syntaxHighlight: {
                activate: true,
                theme: 'monokai',
            },
        },
        uiHooks: {
            onRequest: function (request, reply, next) {
                next();
            },
            preHandler: function (request, reply, next) {
                next();
            },
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => {
            return swaggerObject;
        },
        transformSpecificationClone: true,
    });
}

// Common schema components for reuse
export const commonSchemas = {
    errorResponse: {
        type: 'object',
        properties: {
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' },
        },
    },
    paginationQuery: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            sortBy: { type: 'string' },
            sortOrder: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
        },
    },
    paginatedResponse: {
        type: 'object',
        properties: {
            data: { type: 'array', items: { type: 'object' } },
            meta: {
                type: 'object',
                properties: {
                    total: { type: 'number' },
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    totalPages: { type: 'number' },
                },
            },
        },
    },
};
