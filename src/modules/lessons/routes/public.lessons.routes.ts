import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { lessonsService } from '../lessons.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { getLessonSchema } from '../lessons.schemas';

export async function publicLessonsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Get lesson
    server.get('/:id', {
        schema: getLessonSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const lesson = await lessonsService.findById(id);
        if (!lesson) return ResponseHelper.notFound(reply, 'Lesson');
        ResponseHelper.success(reply, lesson);
    });
}
