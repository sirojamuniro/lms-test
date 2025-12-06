import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

// Extend @fastify/jwt to include our user data
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            userId: number;
            email: string;
            userType: string;
            schoolId?: number;
        };
        user: {
            userId: number;
            email: string;
            userType: string;
            schoolId?: number;
        };
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        authenticateOptional: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

/**
 * Register JWT authentication plugin
 */
export async function registerAuthPlugin(server: FastifyInstance) {
    // Register JWT plugin
    await server.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        sign: {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
        verify: {
            extractToken: (request) => {
                // Try to extract from Authorization header first
                const authHeader = request.headers.authorization;
                if (authHeader?.startsWith('Bearer ')) {
                    return authHeader.substring(7);
                }
                // Fall back to cookie
                return request.cookies?.access_token;
            },
        },
    });

    // Decorate with authentication method
    server.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err: any) {
            reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: err.message || 'Authentication required',
            });
        }
    });

    // Decorate with optional authentication method
    server.decorate('authenticateOptional', async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch {
            // Don't throw, just don't set user
        }
    });

    // Add preHandler hook for public routes tracking
    server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        // Log authenticated user actions
        if (request.user) {
            request.log.info({ userId: request.user.userId }, 'Authenticated request');
        }
    });
}

/**
 * Role-based access control helper
 * @param allowedUserTypes Array of UserType values that are allowed
 */
export function requireUserTypes(...allowedUserTypes: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.user) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        if (!allowedUserTypes.includes(request.user.userType)) {
            return reply.status(403).send({
                statusCode: 403,
                error: 'Forbidden',
                message: `Access denied. Required user type: ${allowedUserTypes.join(' or ')}`,
            });
        }
    };
}

/**
 * Legacy role check - deprecated, use requireUserTypes
 * @deprecated
 */
export function requireRoles(...allowedRoles: string[]) {
    return requireUserTypes(...allowedRoles);
}

/**
 * Check if user owns the resource or has required userType
 */
export function requireOwnershipOrUserType(getOwnerId: (request: FastifyRequest) => Promise<number | null>, ...allowedUserTypes: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.user) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        // Admin bypass
        if (allowedUserTypes.includes(request.user.userType)) {
            return;
        }

        const ownerId = await getOwnerId(request);
        if (ownerId !== request.user.userId) {
            return reply.status(403).send({
                statusCode: 403,
                error: 'Forbidden',
                message: 'You do not have permission to access this resource',
            });
        }
    };
}

/**
 * Legacy - deprecated, use requireOwnershipOrUserType
 * @deprecated
 */
export function requireOwnershipOrRole(getOwnerId: (request: FastifyRequest) => Promise<number | null>, ...allowedRoles: string[]) {
    return requireOwnershipOrUserType(getOwnerId, ...allowedRoles);
}
