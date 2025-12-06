import { MultipartFile } from '@fastify/multipart';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload options configuration
 */
export interface UploadOptions {
    /** Destination directory (relative to project root or absolute) */
    destination?: string;
    /** Maximum file size in bytes */
    maxSize?: number;
    /** Allowed MIME types (e.g., ['image/jpeg', 'image/png']) */
    allowedMimeTypes?: string[];
    /** Allowed file extensions (e.g., ['.jpg', '.png']) */
    allowedExtensions?: string[];
    /** Custom filename generator */
    filenameGenerator?: (originalName: string) => string;
    /** Subdirectory based on date (e.g., 2024/01/15) */
    useDateSubdirectory?: boolean;
    /** Preserve original filename */
    preserveOriginalName?: boolean;
}

/**
 * Upload result
 */
export interface UploadResult {
    /** Generated filename */
    filename: string;
    /** Original filename */
    originalFilename: string;
    /** Full file path */
    filePath: string;
    /** Relative path for URL */
    relativePath: string;
    /** File URL */
    url: string;
    /** MIME type */
    mimeType: string;
    /** File size in bytes */
    fileSize: number;
    /** File extension */
    extension: string;
}

/**
 * Detected file type based on MIME type
 */
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'spreadsheet' | 'presentation' | 'archive' | 'other';

/**
 * Dynamic file upload helper class
 */
export class UploadHelper {
    private static readonly DEFAULT_DESTINATION = './uploads';
    private static readonly DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100MB

    private static readonly MIME_TYPE_MAP: Record<string, FileType> = {
        'image/jpeg': 'image',
        'image/png': 'image',
        'image/gif': 'image',
        'image/webp': 'image',
        'image/svg+xml': 'image',
        'video/mp4': 'video',
        'video/webm': 'video',
        'video/quicktime': 'video',
        'video/x-msvideo': 'video',
        'audio/mpeg': 'audio',
        'audio/wav': 'audio',
        'audio/ogg': 'audio',
        'audio/mp3': 'audio',
        'application/pdf': 'pdf',
        'application/msword': 'document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
        'application/vnd.ms-excel': 'spreadsheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
        'application/vnd.ms-powerpoint': 'presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
        'application/zip': 'archive',
        'application/x-rar-compressed': 'archive',
        'application/x-7z-compressed': 'archive',
        'text/plain': 'document',
        'text/csv': 'spreadsheet',
    };

    /**
     * Upload a single file
     */
    static async uploadFile(file: MultipartFile, options: UploadOptions = {}): Promise<UploadResult> {
        const {
            destination = this.DEFAULT_DESTINATION,
            maxSize = this.DEFAULT_MAX_SIZE,
            allowedMimeTypes,
            allowedExtensions,
            filenameGenerator,
            useDateSubdirectory = false,
            preserveOriginalName = false,
        } = options;

        // Validate file
        if (!file) {
            throw new Error('No file provided');
        }

        const mimeType = file.mimetype || 'application/octet-stream';
        const originalFilename = file.filename;
        const extension = path.extname(originalFilename).toLowerCase();

        // Validate MIME type
        if (allowedMimeTypes && allowedMimeTypes.length > 0) {
            if (!this.validateMimeType(mimeType, allowedMimeTypes)) {
                throw new Error(`File type ${mimeType} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
            }
        }

        // Validate extension
        if (allowedExtensions && allowedExtensions.length > 0) {
            if (!allowedExtensions.includes(extension)) {
                throw new Error(`File extension ${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
            }
        }

        // Generate filename
        let filename: string;
        if (filenameGenerator) {
            filename = filenameGenerator(originalFilename);
        } else if (preserveOriginalName) {
            filename = `${Date.now()}-${this.sanitizeFilename(originalFilename)}`;
        } else {
            filename = this.generateFilename(originalFilename);
        }

        // Determine upload directory
        let uploadDir = path.isAbsolute(destination) ? destination : path.join(process.cwd(), destination);

        if (useDateSubdirectory) {
            const date = new Date();
            const dateDir = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
            uploadDir = path.join(uploadDir, dateDir);
        }

        // Create directory if not exists
        await this.ensureDirectory(uploadDir);

        // Full file path
        const filePath = path.join(uploadDir, filename);

        // Write file using stream
        const writeStream = fs.createWriteStream(filePath);
        await pipeline(file.file, writeStream);

        // Get file size
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        // Validate file size after upload
        if (fileSize > maxSize) {
            // Delete the file if too large
            await this.deleteFile(filePath);
            throw new Error(`File size ${this.formatFileSize(fileSize)} exceeds maximum allowed size ${this.formatFileSize(maxSize)}`);
        }

        // Calculate relative path for URL
        const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        const url = `/${relativePath}`;

        return {
            filename,
            originalFilename,
            filePath,
            relativePath,
            url,
            mimeType,
            fileSize,
            extension,
        };
    }

    /**
     * Upload multiple files
     */
    static async uploadMultiple(files: MultipartFile[], options: UploadOptions = {}): Promise<UploadResult[]> {
        const results: UploadResult[] = [];

        for (const file of files) {
            const result = await this.uploadFile(file, options);
            results.push(result);
        }

        return results;
    }

    /**
     * Delete a file
     */
    static async deleteFile(filePath: string): Promise<boolean> {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Failed to delete file ${filePath}:`, error);
            return false;
        }
    }

    /**
     * Generate a unique filename
     */
    static generateFilename(originalName: string, prefix?: string): string {
        const extension = path.extname(originalName);
        const uuid = uuidv4();
        const timestamp = Date.now();

        if (prefix) {
            return `${prefix}-${timestamp}-${uuid}${extension}`;
        }
        return `${timestamp}-${uuid}${extension}`;
    }

    /**
     * Sanitize filename
     */
    static sanitizeFilename(filename: string): string {
        return filename
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_{2,}/g, '_')
            .toLowerCase();
    }

    /**
     * Validate MIME type
     */
    static validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
        // Support wildcards like 'image/*'
        for (const allowed of allowedTypes) {
            if (allowed.endsWith('/*')) {
                const prefix = allowed.slice(0, -1);
                if (mimeType.startsWith(prefix)) {
                    return true;
                }
            } else if (mimeType === allowed) {
                return true;
            }
        }
        return false;
    }

    /**
     * Detect file type from MIME type
     */
    static detectFileType(mimeType: string): FileType {
        return this.MIME_TYPE_MAP[mimeType] || 'other';
    }

    /**
     * Ensure directory exists
     */
    static async ensureDirectory(dirPath: string): Promise<void> {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * Format file size to human-readable string
     */
    static formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let size = bytes;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Get file metadata
     */
    static async getFileMetadata(filePath: string): Promise<{
        size: number;
        createdAt: Date;
        modifiedAt: Date;
        isFile: boolean;
        isDirectory: boolean;
    } | null> {
        try {
            const stats = fs.statSync(filePath);
            return {
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
            };
        } catch {
            return null;
        }
    }

    /**
     * Check if file exists
     */
    static fileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    /**
     * Copy file
     */
    static async copyFile(sourcePath: string, destinationPath: string): Promise<boolean> {
        try {
            await this.ensureDirectory(path.dirname(destinationPath));
            fs.copyFileSync(sourcePath, destinationPath);
            return true;
        } catch (error) {
            console.error(`Failed to copy file from ${sourcePath} to ${destinationPath}:`, error);
            return false;
        }
    }

    /**
     * Move file
     */
    static async moveFile(sourcePath: string, destinationPath: string): Promise<boolean> {
        try {
            await this.ensureDirectory(path.dirname(destinationPath));
            fs.renameSync(sourcePath, destinationPath);
            return true;
        } catch (error) {
            console.error(`Failed to move file from ${sourcePath} to ${destinationPath}:`, error);
            return false;
        }
    }

    /**
     * Get allowed image types
     */
    static getImageMimeTypes(): string[] {
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    }

    /**
     * Get allowed video types
     */
    static getVideoMimeTypes(): string[] {
        return ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    }

    /**
     * Get allowed document types
     */
    static getDocumentMimeTypes(): string[] {
        return [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
        ];
    }
}
