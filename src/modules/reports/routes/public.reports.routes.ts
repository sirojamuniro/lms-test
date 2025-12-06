import { FastifyInstance } from 'fastify';
import { reportsService } from '../reports.service';

export async function publicReportsRoutes(server: FastifyInstance) {
    server.get(
        '/student/:studentId/semester/:semester',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['studentId', 'semester'],
                    properties: {
                        studentId: { type: 'number' },
                        semester: { type: 'number' },
                    },
                },
                querystring: {
                    type: 'object',
                    properties: {
                        academicYearId: { type: 'number' }
                    }
                },
                tags: ['Public Reports'],
            },
        },
        async (request, reply) => {
            const { studentId, semester } = request.params as any;
            const query = request.query as any;

            // Security check: Students can only see their own report
            if (request.user.userType === 'student' && request.user.userId !== Number(studentId)) {
                return reply.status(403).send({ message: 'Forbidden' });
            }

            return await reportsService.getStudentSemesterReport(Number(studentId), Number(semester), query.academicYearId);
        }
    );
}
