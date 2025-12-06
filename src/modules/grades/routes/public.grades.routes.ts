import { FastifyInstance } from 'fastify';
import { gradesService } from '../grades.service';
import { listGradesQuerySchema } from '../grades.schemas';

export async function publicGradesRoutes(server: FastifyInstance) {
    server.get(
        '/',
        {
            schema: {
                querystring: listGradesQuerySchema,
                tags: ['Public Grades'],
            },
        },
        async (request, reply) => {
            // Students can only see their own grades
            const query = { ...(request.query as any), studentId: request.user.userId };
            return await gradesService.findAll(query);
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
                tags: ['Public Grades'],
            },
        },
        async (request, reply) => {
            const { id } = request.params as any;
            const grade = await gradesService.findOne(Number(id));

            // Security check
            if (grade.studentId !== request.user.userId) {
                return reply.status(403).send({ message: 'Forbidden' });
            }

            return grade;
        }
    );
}
