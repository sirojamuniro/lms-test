import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { lessonsService } from '../lessons.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import {
    createLessonSchema,
    updateLessonSchema,
    deleteLessonSchema,
    reorderLessonsSchema
} from '../lessons.schemas';

export async function adminLessonsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Create lesson
    server.post('/', {
        schema: createLessonSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const lesson = await lessonsService.create(request.body as any);
        ResponseHelper.created(reply, lesson);
    });

    // Update lesson
    server.put('/:id', {
        schema: updateLessonSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const lesson = await lessonsService.update(id, request.body as any);
        if (!lesson) return ResponseHelper.notFound(reply, 'Lesson');
        ResponseHelper.success(reply, lesson);
    });

    // Delete lesson
    server.delete('/:id', {
        schema: deleteLessonSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const deleted = await lessonsService.delete(id);
        if (!deleted) return ResponseHelper.notFound(reply, 'Lesson');
        ResponseHelper.success(reply, null, 200, 'Lesson deleted');
    });

    // Reorder lessons
    server.post('/reorder', {
        schema: reorderLessonsSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { courseId, orders } = request.body as any;
        await lessonsService.reorder(courseId, orders);
        ResponseHelper.success(reply, null, 200, 'Reordered');
    });
}
