import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { rolesService } from '../roles.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import {
    createRoleSchema,
    updateRoleSchema,
    listRolesSchema,
    listPermissionsSchema,
    deleteRoleSchema
} from '../roles.schemas';

export async function adminRolesRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // List roles (Admin only)
    server.get('/', {
        schema: listRolesSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // School Admin can see global roles + their school roles
        const schoolId = request.user.userType === UserType.SCHOOL_ADMIN ? request.user.schoolId : undefined;
        const roles = await rolesService.findAll(schoolId);
        ResponseHelper.success(reply, roles);
    });

    // List permissions
    server.get('/permissions', {
        schema: listPermissionsSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const permissions = await rolesService.getAllPermissions();
        ResponseHelper.success(reply, permissions);
    });

    // Create role
    server.post('/', {
        schema: createRoleSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;

        // Force schoolId for School Admin
        if (request.user.userType === UserType.SCHOOL_ADMIN) {
            body.schoolId = request.user.schoolId;
        }

        try {
            const role = await rolesService.create(body);
            ResponseHelper.created(reply, role);
        } catch (error: any) {
            if (error.statusCode === 409) return ResponseHelper.conflict(reply, error.message);
            throw error;
        }
    });

    // Update role
    server.put('/:id', {
        schema: updateRoleSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };

        // Verify ownership/permission to update this role
        const role = await rolesService.findById(id);
        if (!role) return ResponseHelper.notFound(reply, 'Role');

        // School Admin can only update their own school's roles
        if (request.user.userType === UserType.SCHOOL_ADMIN) {
            if (role.schoolId !== request.user.schoolId) {
                return ResponseHelper.forbidden(reply, 'Cannot update role from another school or global role');
            }
        }

        const updated = await rolesService.update(id, request.body as any);
        ResponseHelper.success(reply, updated);
    });

    // Delete role
    server.delete('/:id', {
        schema: deleteRoleSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };

        // Verify ownership/permission
        const role = await rolesService.findById(id);
        if (!role) return ResponseHelper.notFound(reply, 'Role');

        // School Admin can only delete their own school's roles
        if (request.user.userType === UserType.SCHOOL_ADMIN) {
            if (role.schoolId !== request.user.schoolId) {
                return ResponseHelper.forbidden(reply, 'Cannot delete role from another school or global role');
            }
        }

        try {
            await rolesService.delete(id);
            ResponseHelper.success(reply, null, 200, 'Role deleted');
        } catch (error: any) {
            if (error.statusCode === 403) return ResponseHelper.forbidden(reply, error.message);
            throw error;
        }
    });
}
