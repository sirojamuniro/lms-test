import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { attachmentsService, AttachmentsService } from '../attachments.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { UploadHelper } from '../../../helpers/upload.helper';
import { EntityType } from '../../../types';
import {
    uploadAttachmentSchema,
    deleteAttachmentSchema
} from '../attachments.schemas';

export async function adminAttachmentsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Upload file
    server.post('/upload', {
        schema: uploadAttachmentSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await request.file();
        if (!data) return ResponseHelper.badRequest(reply, 'No file');

        const fields = data.fields as any;
        const entityType = fields.entityType?.value as EntityType;
        const entityId = parseInt(fields.entityId?.value || '0');

        if (!entityType || !entityId) return ResponseHelper.badRequest(reply, 'entityType and entityId required');

        try {
            const result = await UploadHelper.uploadFile(data, { destination: './uploads/attachments', useDateSubdirectory: true });
            const attachment = await attachmentsService.create({
                filename: result.filename,
                originalFilename: result.originalFilename,
                filePath: result.filePath,
                mimeType: result.mimeType,
                fileSize: result.fileSize,
                type: AttachmentsService.getAttachmentType(result.mimeType),
                entityType, entityId,
                courseId: fields.courseId?.value ? parseInt(fields.courseId.value) : undefined,
                lessonId: fields.lessonId?.value ? parseInt(fields.lessonId.value) : undefined,
                uploadedById: request.user.userId,
            });
            ResponseHelper.created(reply, attachment);
        } catch (error: any) {
            return ResponseHelper.badRequest(reply, error.message);
        }
    });

    // Delete
    server.delete('/:id', {
        schema: deleteAttachmentSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const deleted = await attachmentsService.delete(id);
        if (!deleted) return ResponseHelper.notFound(reply, 'Attachment');
        ResponseHelper.success(reply, null, 200, 'Deleted');
    });
}
