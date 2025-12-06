import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { enrollmentsService } from '../enrollments.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { UserType } from '../../../entities/user.entity';
import {
    enrollSchema,
    checkEnrollmentSchema,
    unenrollSchema
} from '../enrollments.schemas';

export async function publicEnrollmentsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Get my enrollments
    server.get('/my', {
        schema: { description: 'Get my enrollments', tags: ['Enrollments'] },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const enrollments = await enrollmentsService.findByUser(request.user.userId);
        ResponseHelper.success(reply, enrollments);
    });

    // Enroll
    server.post('/', {
        schema: enrollSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { courseId, pricePaid } = request.body as any;
        try {
            const enrollment = await enrollmentsService.create({
                studentId: request.user.userId,
                courseId,
                pricePaid
            });
            ResponseHelper.created(reply, enrollment);
        } catch (error: any) {
            if (error.statusCode === 409) return ResponseHelper.conflict(reply, error.message);
            throw error;
        }
    });

    // Check enrollment
    server.get('/check/:courseId', {
        schema: checkEnrollmentSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { courseId } = request.params as { courseId: number };
        const isEnrolled = await enrollmentsService.isEnrolled(request.user.userId, courseId);
        ResponseHelper.success(reply, { isEnrolled });
    });

    // Unenroll
    server.delete('/:id', {
        schema: unenrollSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const enrollment = await enrollmentsService.findById(id);
        if (!enrollment) return ResponseHelper.notFound(reply, 'Enrollment');

        // Check if user is admin or the owner
        const isAdmin = [UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN].includes(
            request.user.userType as UserType
        );
        if (!isAdmin && enrollment.studentId !== request.user.userId) {
            return ResponseHelper.forbidden(reply);
        }

        await enrollmentsService.delete(id);
        ResponseHelper.success(reply, null, 200, 'Unenrolled');
    });
}
