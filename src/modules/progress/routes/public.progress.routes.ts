import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { progressService } from '../progress.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import {
    getLessonProgressSchema,
    updateProgressSchema,
    markLessonCompleteSchema,
    getCourseProgressSchema
} from '../progress.schemas';

export async function publicProgressRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Get lesson progress
    server.get('/lesson/:lessonId', {
        schema: getLessonProgressSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { lessonId } = request.params as { lessonId: number };
        const progress = await progressService.getOrCreate(request.user.userId, lessonId);
        ResponseHelper.success(reply, progress);
    });

    // Update lesson progress
    server.post('/lesson/:lessonId', {
        schema: updateProgressSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { lessonId } = request.params as { lessonId: number };
        const progress = await progressService.update(request.user.userId, lessonId, request.body as any);
        ResponseHelper.success(reply, progress);
    });

    // Mark lesson complete
    server.post('/lesson/:lessonId/complete', {
        schema: markLessonCompleteSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { lessonId } = request.params as { lessonId: number };
        const progress = await progressService.markComplete(request.user.userId, lessonId);
        ResponseHelper.success(reply, progress);
    });

    // Get course progress
    server.get('/course/:courseId', {
        schema: getCourseProgressSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { courseId } = request.params as { courseId: number };
        const progress = await progressService.getUserCourseProgress(request.user.userId, courseId);
        ResponseHelper.success(reply, progress);
    });
}
