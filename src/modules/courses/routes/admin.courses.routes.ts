import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { coursesService } from '../courses.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import {
    createCourseSchema,
    updateCourseSchema,
    deleteCourseSchema
} from '../courses.schemas';

export async function adminCoursesRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Create course
    server.post('/', {
        schema: createCourseSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;
        const course = await coursesService.create({
            ...body,
            instructorId: request.user.userId,
            schoolId: request.user.schoolId,
        });
        ResponseHelper.created(reply, course);
    });

    // Update course
    server.put('/:id', {
        schema: updateCourseSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        try {
            const course = await coursesService.update(
                id,
                request.body as any,
                request.user.userId,
                request.user.userType
            );
            if (!course) return ResponseHelper.notFound(reply, 'Course');
            ResponseHelper.success(reply, course);
        } catch (error: any) {
            if (error.statusCode === 403) return ResponseHelper.forbidden(reply, error.message);
            throw error;
        }
    });

    // Delete course
    server.delete('/:id', {
        schema: deleteCourseSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        try {
            const deleted = await coursesService.delete(
                id,
                request.user.userId,
                request.user.userType
            );
            if (!deleted) return ResponseHelper.notFound(reply, 'Course');
            ResponseHelper.success(reply, null, 200, 'Course deleted');
        } catch (error: any) {
            if (error.statusCode === 403) return ResponseHelper.forbidden(reply, error.message);
            throw error;
        }
    });
}
