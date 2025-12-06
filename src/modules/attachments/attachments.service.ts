import { AppDataSource } from '../../plugins/database.plugin';
import { Attachment } from '../../entities/attachment.entity';
import { AttachmentType, EntityType } from '../../types';
import { UploadHelper } from '../../helpers/upload.helper';

export interface CreateAttachmentData {
    filename: string;
    originalFilename: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    type: AttachmentType;
    entityType: EntityType;
    entityId: number;
    courseId?: number;
    lessonId?: number;
    uploadedById: number;
}

/**
 * Attachments service
 */
export class AttachmentsService {
    private attachmentRepository = AppDataSource.getRepository(Attachment);

    /**
     * Create a new attachment record
     */
    async create(data: CreateAttachmentData): Promise<Attachment> {
        const attachment = this.attachmentRepository.create(data);
        return this.attachmentRepository.save(attachment);
    }

    /**
     * Find all attachments with optional filters
     */
    async findAll(entityType?: EntityType, entityId?: number): Promise<Attachment[]> {
        const query = this.attachmentRepository
            .createQueryBuilder('attachment')
            .leftJoinAndSelect('attachment.uploadedBy', 'uploadedBy');

        if (entityType && entityId) {
            query.where('attachment.entityType = :entityType', { entityType });
            query.andWhere('attachment.entityId = :entityId', { entityId });
        }

        return query.orderBy('attachment.createdAt', 'DESC').getMany();
    }

    /**
     * Find attachment by ID
     */
    async findById(id: number): Promise<Attachment | null> {
        return this.attachmentRepository.findOne({
            where: { id },
            relations: ['uploadedBy', 'course', 'lesson'],
        });
    }

    /**
     * Find attachments by entity
     */
    async findByEntity(entityType: EntityType, entityId: number): Promise<Attachment[]> {
        return this.attachmentRepository.find({
            where: { entityType, entityId },
            relations: ['uploadedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Delete attachment (including file)
     */
    async delete(id: number): Promise<boolean> {
        const attachment = await this.attachmentRepository.findOne({ where: { id } });

        if (!attachment) {
            return false;
        }

        // Delete file from disk
        await UploadHelper.deleteFile(attachment.filePath);

        // Delete database record
        const result = await this.attachmentRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * Get attachment type from MIME type
     */
    static getAttachmentType(mimeType: string): AttachmentType {
        if (mimeType.startsWith('video/')) return AttachmentType.VIDEO;
        if (mimeType.startsWith('image/')) return AttachmentType.IMAGE;
        if (mimeType.startsWith('audio/')) return AttachmentType.AUDIO;
        if (mimeType === 'application/pdf') return AttachmentType.PDF;
        if (mimeType.includes('word') || mimeType.includes('document')) return AttachmentType.DOCUMENT;
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return AttachmentType.SPREADSHEET;
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return AttachmentType.PRESENTATION;
        return AttachmentType.FILE;
    }
}

// Export singleton instance
export const attachmentsService = new AttachmentsService();
