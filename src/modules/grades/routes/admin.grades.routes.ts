import { FastifyInstance } from 'fastify';
import { gradesService } from '../grades.service';
import { createGradeSchema, updateGradeSchema, listGradesQuerySchema } from '../grades.schemas';
import { requireRoles } from '../../../plugins/auth.plugin';
import { UserType } from '../../../types';

export async function adminGradesRoutes(server: FastifyInstance) {
    server.post(
        '/',
        {
            schema: {
                body: createGradeSchema,
                tags: ['Admin Grades'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            const grade = await gradesService.create({
                ...(request.body as any),
                gradedById: request.user.userId,
            });
            return reply.status(201).send(grade);
        }
    );

    server.get(
        '/',
        {
            schema: {
                querystring: listGradesQuerySchema,
                tags: ['Admin Grades'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            return await gradesService.findAll(request.query);
        }
    );

    server.get(
        '/:id',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'number' } },
                },
                tags: ['Admin Grades'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            const { id } = request.params as any;
            return await gradesService.findOne(Number(id));
        }
    );

    server.put(
        '/:id',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'number' } },
                },
                body: updateGradeSchema,
                tags: ['Admin Grades'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            const { id } = request.params as any;
            const grade = await gradesService.update(Number(id), request.body as any);
            return reply.send(grade);
        }
    );

    server.delete(
        '/:id',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'number' } },
                },
                tags: ['Admin Grades'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            const { id } = request.params as any;
            await gradesService.delete(Number(id));
            return reply.status(204).send();
        }
    );
}
