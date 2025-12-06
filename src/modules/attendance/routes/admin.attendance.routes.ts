import { FastifyInstance } from 'fastify';
import { attendanceService } from '../attendance.service';
import { createAttendanceSchema, updateAttendanceSchema, listAttendanceQuerySchema } from '../attendance.schemas';
import { requireRoles } from '../../../plugins/auth.plugin';
import { UserType } from '../../../types';

export async function adminAttendanceRoutes(server: FastifyInstance) {
    server.post(
        '/bulk',
        {
            schema: {
                body: createAttendanceSchema,
                tags: ['Admin Attendance'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            const results = await attendanceService.createBulk(request.body, request.user.userId);
            return reply.status(201).send(results);
        }
    );

    server.get(
        '/',
        {
            schema: {
                querystring: listAttendanceQuerySchema,
                tags: ['Admin Attendance'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            return await attendanceService.findAll(request.query);
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
                body: updateAttendanceSchema,
                tags: ['Admin Attendance'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN, UserType.TEACHER)],
        },
        async (request, reply) => {
            const { id } = request.params as any;
            const attendance = await attendanceService.update(Number(id), request.body as any);
            return reply.send(attendance);
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
                tags: ['Admin Attendance'],
            },
            preHandler: [requireRoles(UserType.SCHOOL_ADMIN)],
        },
        async (request, reply) => {
            const { id } = request.params as any;
            await attendanceService.delete(Number(id));
            return reply.status(204).send();
        }
    );
}
