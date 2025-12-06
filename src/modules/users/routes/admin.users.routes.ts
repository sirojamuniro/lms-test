import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { usersService } from '../users.service';
import { ResponseHelper, getPaginationParams } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UploadHelper } from '../../../helpers/upload.helper';
import { UserType } from '../../../entities/user.entity';
import {
    createUserSchema,
    updateUserSchema,
    listUsersSchema,
    getUserSchema,
    deleteUserSchema,
    uploadAvatarSchema
} from '../users.schemas';

export async function adminUsersRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);
    // Add Super Admin and School Admin check for all routes in this file
    server.addHook('preHandler', requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN));

    // List users
    server.get('/', {
        schema: listUsersSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;
        const { page, limit } = getPaginationParams(query);
        // Pass user's schoolId to filter if they are School Admin
        const schoolId = request.user.userType === UserType.SCHOOL_ADMIN ? request.user.schoolId : undefined;

        const { data, total } = await usersService.findAll({
            ...query,
            page,
            limit,
            schoolId: query.schoolId || schoolId // Force schoolId filter for School Admin
        });
        ResponseHelper.paginated(reply, data, total, page, limit);
    });

    // Create user
    server.post('/', {
        schema: createUserSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as any;

            // If School Admin creates user, force schoolId
            if (request.user.userType === UserType.SCHOOL_ADMIN) {
                body.schoolId = request.user.schoolId;
            }

            const user = await usersService.create(body);
            ResponseHelper.created(reply, user);
        } catch (error: any) {
            if (error.statusCode === 409) return ResponseHelper.conflict(reply, error.message);
            throw error;
        }
    });

    // Get user details
    server.get('/:id', {
        schema: getUserSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const user = await usersService.findById(id);
        if (!user) return ResponseHelper.notFound(reply, 'User');
        ResponseHelper.success(reply, user);
    });

    // Update user
    server.put('/:id', {
        schema: updateUserSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const user = await usersService.update(id, request.body as any);
        if (!user) return ResponseHelper.notFound(reply, 'User');
        ResponseHelper.success(reply, user);
    });

    // Delete user
    server.delete('/:id', {
        schema: deleteUserSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const deleted = await usersService.delete(id);
        if (!deleted) return ResponseHelper.notFound(reply, 'User');
        ResponseHelper.success(reply, null, 200, 'User deleted');
    });

    // Stats
    server.get('/stats/overview', {
        schema: { description: 'User statistics', tags: ['Admin - Users'] },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const stats = await usersService.getStats();
        ResponseHelper.success(reply, stats);
    });
}
