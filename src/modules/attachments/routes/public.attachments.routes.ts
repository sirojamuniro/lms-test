import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { attachmentsService } from '../attachments.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import * as fs from 'fs';
import {
    listAttachmentsSchema,
    getAttachmentSchema,
    downloadAttachmentSchema
} from '../attachments.schemas';

export async function publicAttachmentsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // List attachments
    server.get('/', {
        schema: listAttachmentsSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { entityType, entityId } = request.query as any;
        const attachments = await attachmentsService.findAll(entityType, entityId ? parseInt(entityId) : undefined);
        ResponseHelper.success(reply, attachments);
    });

    // Get attachment
    server.get('/:id', {
        schema: getAttachmentSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const attachment = await attachmentsService.findById(id);
        if (!attachment) return ResponseHelper.notFound(reply, 'Attachment');
        ResponseHelper.success(reply, attachment);
    });

    // Download
    server.get('/:id/download', {
        schema: downloadAttachmentSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const attachment = await attachmentsService.findById(id);
        if (!attachment || !fs.existsSync(attachment.filePath)) return ResponseHelper.notFound(reply, 'File');
        reply.header('Content-Type', attachment.mimeType).header('Content-Disposition', `attachment; filename="${attachment.originalFilename}"`).send(fs.createReadStream(attachment.filePath));
    });
}
