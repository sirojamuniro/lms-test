import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { usersService } from '../users.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { UploadHelper } from '../../../helpers/upload.helper';
import {
    getUserSchema,
    updateProfileSchema,
    uploadAvatarSchema
} from '../users.schemas';

export async function publicUsersRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Get own profile (or view others if allowed - but strict ID check for now)
    server.get('/:id', {
        schema: { ...getUserSchema, tags: ['Users'] },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };

        // Only allow viewing own profile here (Admin route handles others)
        if (request.user.userId !== id) {
            return ResponseHelper.forbidden(reply, 'You can only view your own profile');
        }

        const user = await usersService.findById(id);
        if (!user) return ResponseHelper.notFound(reply, 'User');
        ResponseHelper.success(reply, user);
    });

    // Update own profile
    server.put('/:id', {
        schema: updateProfileSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };

        if (request.user.userId !== id) {
            return ResponseHelper.forbidden(reply, 'You can only update your own profile');
        }

        const updated = await usersService.update(id, request.body as any);
        ResponseHelper.success(reply, updated);
    });

    // Upload avatar
    server.put('/:id/avatar', {
        schema: uploadAvatarSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };

        if (request.user.userId !== id) {
            return ResponseHelper.forbidden(reply, 'You can only upload your own avatar');
        }

        const file = await request.file();
        if (!file) return ResponseHelper.badRequest(reply, 'No file');
        try {
            const result = await UploadHelper.uploadFile(file, {
                destination: './uploads/avatars',
                allowedMimeTypes: UploadHelper.getImageMimeTypes(),
                maxSize: 5 * 1024 * 1024,
            });
            const user = await usersService.updateAvatar(id, result.url);
            ResponseHelper.success(reply, { avatar: result.url });
        } catch (error: any) {
            return ResponseHelper.badRequest(reply, error.message);
        }
    });
}
