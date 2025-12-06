import { FastifyInstance } from 'fastify';
import { attendanceService } from '../attendance.service';
import { listAttendanceQuerySchema } from '../attendance.schemas';

export async function publicAttendanceRoutes(server: FastifyInstance) {
    server.get(
        '/',
        {
            schema: {
                querystring: listAttendanceQuerySchema,
                tags: ['Public Attendance'],
            },
        },
        async (request, reply) => {
            // Students can only see their own attendance
            const query = { ...(request.query as any), studentId: request.user.userId };
            return await attendanceService.findAll(query);
        }
    );
}
