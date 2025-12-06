import { FastifyReply } from 'fastify';

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = any> {
    statusCode: number;
    message: string;
    data?: T;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
    statusCode: number;
    error: string;
    message: string;
    details?: any;
}

/**
 * Response helper class
 */
export class ResponseHelper {
    /**
     * Send success response
     */
    static success<T>(reply: FastifyReply, data: T, statusCode = 200, message = 'Success'): void {
        reply.status(statusCode).send({
            statusCode,
            message,
            data,
        });
    }

    /**
     * Send created response
     */
    static created<T>(reply: FastifyReply, data: T, message = 'Resource created successfully'): void {
        this.success(reply, data, 201, message);
    }

    /**
     * Send no content response
     */
    static noContent(reply: FastifyReply): void {
        reply.status(204).send();
    }

    /**
     * Send paginated response
     */
    static paginated<T>(
        reply: FastifyReply,
        data: T[],
        total: number,
        page: number,
        limit: number
    ): void {
        const totalPages = Math.ceil(total / limit);

        reply.status(200).send({
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    }

    /**
     * Send error response
     */
    static error(
        reply: FastifyReply,
        statusCode: number,
        error: string,
        message: string,
        details?: any
    ): void {
        const response: ErrorResponse = {
            statusCode,
            error,
            message,
        };

        if (details) {
            response.details = details;
        }

        reply.status(statusCode).send(response);
    }

    /**
     * Send bad request error
     */
    static badRequest(reply: FastifyReply, message: string, details?: any): void {
        this.error(reply, 400, 'Bad Request', message, details);
    }

    /**
     * Send unauthorized error
     */
    static unauthorized(reply: FastifyReply, message = 'Unauthorized'): void {
        this.error(reply, 401, 'Unauthorized', message);
    }

    /**
     * Send forbidden error
     */
    static forbidden(reply: FastifyReply, message = 'Access denied'): void {
        this.error(reply, 403, 'Forbidden', message);
    }

    /**
     * Send not found error
     */
    static notFound(reply: FastifyReply, resource = 'Resource'): void {
        this.error(reply, 404, 'Not Found', `${resource} not found`);
    }

    /**
     * Send conflict error
     */
    static conflict(reply: FastifyReply, message: string): void {
        this.error(reply, 409, 'Conflict', message);
    }

    /**
     * Send validation error
     */
    static validationError(reply: FastifyReply, errors: any[]): void {
        this.error(reply, 422, 'Validation Error', 'Validation failed', errors);
    }

    /**
     * Send internal server error
     */
    static serverError(reply: FastifyReply, message = 'Internal server error'): void {
        this.error(reply, 500, 'Internal Server Error', message);
    }
}

/**
 * Build pagination meta from query params
 */
export function getPaginationParams(query: any): { page: number; limit: number; skip: number } {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Build sort options from query params
 */
export function getSortParams(query: any, allowedFields: string[]): { sortBy: string; sortOrder: 'ASC' | 'DESC' } {
    const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return { sortBy, sortOrder };
}
