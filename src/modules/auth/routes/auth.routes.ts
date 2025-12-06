import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../auth.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    logoutSchema,
    getMeSchema,
    changePasswordSchema
} from '../auth.schemas';

export async function authRoutes(server: FastifyInstance) {
    // Register
    server.post('/register', {
        schema: registerSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as any;
            const user = await authService.register(body);
            const token = await reply.jwtSign({
                userId: user.id,
                email: user.email,
                userType: user.userType
            });
            ResponseHelper.created(reply, {
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    userType: user.userType
                }
            });
        } catch (error: any) {
            if (error.statusCode === 409) return ResponseHelper.conflict(reply, error.message);
            throw error;
        }
    });

    // Login
    server.post('/login', {
        schema: loginSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { email, password } = request.body as any;
        const user = await authService.validateCredentials(email, password);

        if (!user) return ResponseHelper.unauthorized(reply, 'Invalid credentials');
        if (!user.isActive) return ResponseHelper.forbidden(reply, 'Account deactivated');

        const accessToken = await reply.jwtSign({
            userId: user.id,
            email: user.email,
            userType: user.userType,
            schoolId: user.primarySchoolId,
        });
        const refreshToken = server.jwt.sign(
            { userId: user.id, type: 'refresh' } as any,
            { expiresIn: '30d' }
        );
        await authService.updateRefreshToken(user.id, refreshToken as string);

        reply.setCookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 604800
        });
        ResponseHelper.success(reply, {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                firstName: user.firstName,
                lastName: user.lastName,
            }
        });
    });

    // Refresh token
    server.post('/refresh', {
        schema: refreshTokenSchema,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { refresh_token } = request.body as any;
        try {
            const decoded = server.jwt.verify<{ userId: number; type: string }>(refresh_token);
            if (decoded.type !== 'refresh') return ResponseHelper.unauthorized(reply, 'Invalid token');

            const user = await authService.validateRefreshToken(decoded.userId, refresh_token);
            if (!user) return ResponseHelper.unauthorized(reply, 'Invalid token');

            const newToken = await reply.jwtSign({
                userId: user.id,
                email: user.email,
                userType: user.userType,
                schoolId: user.primarySchoolId,
            });
            ResponseHelper.success(reply, { access_token: newToken });
        } catch {
            return ResponseHelper.unauthorized(reply, 'Invalid token');
        }
    });

    // Logout
    server.post('/logout', {
        schema: logoutSchema,
        preHandler: [server.authenticate],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        await authService.updateRefreshToken(request.user.userId, null);
        reply.clearCookie('access_token');
        ResponseHelper.success(reply, null, 200, 'Logged out');
    });

    // Get me
    server.get('/me', {
        schema: getMeSchema,
        preHandler: [server.authenticate],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = await authService.findById(request.user.userId);
        if (!user) return ResponseHelper.notFound(reply, 'User');
        ResponseHelper.success(reply, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            avatar: user.avatar,
            primarySchoolId: user.primarySchoolId,
        });
    });

    // Change password
    server.post('/change-password', {
        schema: changePasswordSchema,
        preHandler: [server.authenticate],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { currentPassword, newPassword } = request.body as any;
        const success = await authService.changePassword(request.user.userId, currentPassword, newPassword);
        if (!success) return ResponseHelper.badRequest(reply, 'Invalid current password');
        ResponseHelper.success(reply, null, 200, 'Password changed');
    });
}
