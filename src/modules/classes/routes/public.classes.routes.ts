import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { classesService } from '../classes.service';
import { ResponseHelper, getPaginationParams } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import { listClassesSchema, getClassSchema } from '../classes.schemas';

export async function publicClassesRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // List classes
    server.get('/', {
        schema: listClassesSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN, UserType.TEACHER, UserType.STUDENT)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;
        const { page, limit } = getPaginationParams(query);

        // Auto-filter by school for School Admin/Teacher/Student
        if (request.user.userType !== UserType.SUPER_ADMIN) {
            query.schoolId = request.user.schoolId;
        }

        const { data, total } = await classesService.findAll({ ...query, page, limit });
        ResponseHelper.paginated(reply, data, total, page, limit);
    });

    // Get class details
    server.get('/:id', {
        schema: getClassSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const cls = await classesService.findById(id);

        if (!cls) return ResponseHelper.notFound(reply, 'Class');

        // Verify school access
        if (request.user.userType !== UserType.SUPER_ADMIN && cls.schoolId !== request.user.schoolId) {
            return ResponseHelper.forbidden(reply, 'Access denied to class from another school');
        }

        ResponseHelper.success(reply, cls);
    });
}
