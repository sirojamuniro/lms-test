import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import formbody from '@fastify/formbody';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';
import path from 'path';

/**
 * Register all security-related plugins
 */
export async function registerSecurityPlugins(server: FastifyInstance) {
    // Helmet - Security headers
    await server.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    });

    // CORS - Cross-Origin Resource Sharing
    await server.register(cors, {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
        maxAge: 86400, // 24 hours
    });

    // Rate Limiting
    await server.register(rateLimit, {
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
        errorResponseBuilder: (request, context) => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: `Rate limit exceeded. You have exceeded the ${context.max} requests in ${context.after} limit!`,
            retryAfter: context.after,
        }),
        keyGenerator: (request) => request.ip,
        skipOnError: true,
        addHeadersOnExceeding: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
        },
        addHeaders: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
            'retry-after': true,
        },
    });

    // Multipart - File uploads
    await server.register(multipart, {
        limits: {
            fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB default
            files: parseInt(process.env.MAX_FILES || '10', 10),
        },
        attachFieldsToBody: false,
    });

    // Form body parser
    await server.register(formbody);

    // Cookie support
    await server.register(cookie, {
        secret: process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'super-secret-cookie-key',
        parseOptions: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        },
    });

    // Sensible - Useful defaults
    await server.register(sensible);

    // Static file serving for uploads
    await server.register(fastifyStatic, {
        root: path.join(process.cwd(), 'uploads'),
        prefix: '/uploads/',
        decorateReply: false,
    });

    // Custom security headers hook
    server.addHook('onSend', async (request, reply) => {
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('X-XSS-Protection', '1; mode=block');
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    });

    // Request logging hook
    server.addHook('onRequest', async (request) => {
        request.log.info({
            method: request.method,
            url: request.url,
            ip: request.ip,
        }, 'Incoming request');
    });
}
