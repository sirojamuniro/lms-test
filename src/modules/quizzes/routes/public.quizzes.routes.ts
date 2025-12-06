import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { quizzesService } from '../quizzes.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import {
    getQuizSchema,
    startAttemptSchema,
    submitAttemptSchema,
    getAttemptResultsSchema
} from '../quizzes.schemas';

export async function publicQuizzesRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Get quiz
    server.get('/:id', {
        schema: getQuizSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const quiz = await quizzesService.findById(id, true);
        if (!quiz) return ResponseHelper.notFound(reply, 'Quiz');
        ResponseHelper.success(reply, quiz);
    });

    // Start attempt
    server.post('/:id/attempt', {
        schema: startAttemptSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        try {
            const attempt = await quizzesService.startAttempt(request.user.userId, id);
            ResponseHelper.created(reply, attempt);
        } catch (e: any) {
            if (e.statusCode === 400) return ResponseHelper.badRequest(reply, e.message);
            throw e;
        }
    });

    // Submit attempt
    server.post('/attempt/:attemptId/submit', {
        schema: submitAttemptSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { attemptId } = request.params as { attemptId: number };
        const { answers } = request.body as any;
        const result = await quizzesService.submitAttempt(attemptId, answers);
        ResponseHelper.success(reply, result);
    });

    // Get attempt results
    server.get('/attempt/:attemptId/results', {
        schema: getAttemptResultsSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { attemptId } = request.params as { attemptId: number };
        const result = await quizzesService.getAttemptResults(attemptId);
        if (!result) return ResponseHelper.notFound(reply, 'Attempt');
        ResponseHelper.success(reply, result);
    });
}
