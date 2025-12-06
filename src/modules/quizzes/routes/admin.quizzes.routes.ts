import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { quizzesService } from '../quizzes.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import {
    createQuizSchema,
    updateQuizSchema,
    deleteQuizSchema
} from '../quizzes.schemas';

export async function adminQuizzesRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Create quiz
    server.post('/', {
        schema: createQuizSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const quiz = await quizzesService.create(request.body as any);
        ResponseHelper.created(reply, quiz);
    });

    // Update quiz
    server.put('/:id', {
        schema: updateQuizSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const quiz = await quizzesService.update(id, request.body as any);
        if (!quiz) return ResponseHelper.notFound(reply, 'Quiz');
        ResponseHelper.success(reply, quiz);
    });

    // Delete quiz
    server.delete('/:id', {
        schema: deleteQuizSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const deleted = await quizzesService.delete(id);
        if (!deleted) return ResponseHelper.notFound(reply, 'Quiz');
        ResponseHelper.success(reply, null, 200, 'Quiz deleted');
    });
}
