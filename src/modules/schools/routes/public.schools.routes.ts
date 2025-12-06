import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { schoolsService } from '../schools.service';
import { ResponseHelper, getPaginationParams } from '../../../helpers/response.helper';
import { listSchoolsSchema, getSchoolSchema } from '../schools.schemas';

export async function publicSchoolsRoutes(server: FastifyInstance) {
    // List schools (Public or Authenticated)
    server.get('/', {
        schema: listSchoolsSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;
        const { page, limit } = getPaginationParams(query);
        const { data, total } = await schoolsService.findAll({ ...query, page, limit });
        ResponseHelper.paginated(reply, data, total, page, limit);
    });

    // Get school details
    server.get('/:id', {
        schema: getSchoolSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const school = await schoolsService.findById(id);
        if (!school) return ResponseHelper.notFound(reply, 'School');
        ResponseHelper.success(reply, school);
    });
}
