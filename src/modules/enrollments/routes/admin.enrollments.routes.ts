import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { enrollmentsService } from '../enrollments.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import { EnrollmentStatus } from '../../../types';
import {
    getCourseEnrollmentsSchema,
    updateEnrollmentStatusSchema
} from '../enrollments.schemas';

export async function adminEnrollmentsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Get course enrollments (instructor/admin)
    server.get('/course/:courseId', {
        schema: getCourseEnrollmentsSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { courseId } = request.params as { courseId: number };
        const enrollments = await enrollmentsService.findByCourse(courseId);
        ResponseHelper.success(reply, enrollments);
    });

    // Update status (admin/instructor)
    server.put('/:id/status', {
        schema: updateEnrollmentStatusSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const { status } = request.body as { status: EnrollmentStatus };
        const enrollment = await enrollmentsService.updateStatus(id, status);
        if (!enrollment) return ResponseHelper.notFound(reply, 'Enrollment');
        ResponseHelper.success(reply, enrollment);
    });
}
