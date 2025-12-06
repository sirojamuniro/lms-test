import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { schoolsService } from '../schools.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import {
    createSchoolSchema,
    updateSchoolSchema,
    deleteSchoolSchema
} from '../schools.schemas';

export async function adminSchoolsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Create school (Super Admin / Foundation Admin)
    server.post('/', {
        schema: createSchoolSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.FOUNDATION_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;
        try {
            const school = await schoolsService.create(body);
            ResponseHelper.created(reply, school);
        } catch (error: any) {
            if (error.statusCode === 409) return ResponseHelper.conflict(reply, error.message);
            throw error;
        }
    });

    // Update school
    server.put('/:id', {
        schema: updateSchoolSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.FOUNDATION_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };

        // School Admin can only update their own school
        if (request.user.userType === UserType.SCHOOL_ADMIN && request.user.schoolId !== id) {
            return ResponseHelper.forbidden(reply, 'You can only update your own school');
        }

        const school = await schoolsService.update(id, request.body as any);
        if (!school) return ResponseHelper.notFound(reply, 'School');
        ResponseHelper.success(reply, school);
    });

    // Delete school (Super Admin only)
    server.delete('/:id', {
        schema: deleteSchoolSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const deleted = await schoolsService.delete(id);
        if (!deleted) return ResponseHelper.notFound(reply, 'School');
        ResponseHelper.success(reply, null, 200, 'School deleted');
    });
}
