import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { coursesService } from '../courses.service';
// Note: importing from Services temporarily until Lessons is refactored
import { lessonsService } from '../../lessons/lessons.service';
import { ResponseHelper, getPaginationParams } from '../../../helpers/response.helper';
import { listCoursesSchema, getCourseSchema, getCourseLessonsSchema } from '../courses.schemas';
import { UserType } from '../../../entities/user.entity';

export async function publicCoursesRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // List courses
    server.get('/', {
        schema: listCoursesSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;
        const { page, limit } = getPaginationParams(query);

        // Auto-filter by school for School Admin/Teacher/Student (if not Super Admin)
        if (request.user.userType !== UserType.SUPER_ADMIN && request.user.schoolId) {
            query.schoolId = request.user.schoolId;
        }

        const { data, total } = await coursesService.findAll(
            { ...query, page, limit },
            request.user.userType,
            request.user.userId
        );
        ResponseHelper.paginated(reply, data, total, page, limit);
    });

    // Get course
    server.get('/:id', {
        schema: getCourseSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const course = await coursesService.findById(id, request.user.userType, request.user.userId);
        if (!course) return ResponseHelper.notFound(reply, 'Course');
        ResponseHelper.success(reply, course);
    });

    // Get course lessons
    server.get('/:id/lessons', {
        schema: getCourseLessonsSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const lessons = await lessonsService.findByCourse(id);
        ResponseHelper.success(reply, lessons);
    });
}
