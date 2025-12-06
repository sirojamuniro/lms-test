import Fastify, { FastifyInstance } from 'fastify';
import { config } from 'dotenv';

// Load environment variables
config();

// Import plugins
import { registerSecurityPlugins } from './plugins/security.plugin';
import { registerAuthPlugin } from './plugins/auth.plugin';
import { registerDatabasePlugin } from './plugins/database.plugin';
import { registerSwaggerPlugin } from './plugins/swagger.plugin';

// Import routes
import { authRoutes } from './modules/auth/routes/auth.routes';
import { adminUsersRoutes } from './modules/users/routes/admin.users.routes';
import { publicUsersRoutes } from './modules/users/routes/public.users.routes';
import { adminSchoolsRoutes } from './modules/schools/routes/admin.schools.routes';
import { publicSchoolsRoutes } from './modules/schools/routes/public.schools.routes';
import { adminRolesRoutes } from './modules/roles/routes/admin.roles.routes';
import { adminClassesRoutes } from './modules/classes/routes/admin.classes.routes';
import { publicClassesRoutes } from './modules/classes/routes/public.classes.routes';
import { adminCoursesRoutes } from './modules/courses/routes/admin.courses.routes';
import { publicCoursesRoutes } from './modules/courses/routes/public.courses.routes';
import { adminLessonsRoutes } from './modules/lessons/routes/admin.lessons.routes';
import { publicLessonsRoutes } from './modules/lessons/routes/public.lessons.routes';
import { adminQuizzesRoutes } from './modules/quizzes/routes/admin.quizzes.routes';
import { publicQuizzesRoutes } from './modules/quizzes/routes/public.quizzes.routes';
import { adminEnrollmentsRoutes } from './modules/enrollments/routes/admin.enrollments.routes';
import { publicEnrollmentsRoutes } from './modules/enrollments/routes/public.enrollments.routes';
import { publicProgressRoutes } from './modules/progress/routes/public.progress.routes';
import { adminAttachmentsRoutes } from './modules/attachments/routes/admin.attachments.routes';
import { publicAttachmentsRoutes } from './modules/attachments/routes/public.attachments.routes';
import { adminGradesRoutes } from './modules/grades/routes/admin.grades.routes';
import { publicGradesRoutes } from './modules/grades/routes/public.grades.routes';
import { adminAttendanceRoutes } from './modules/attendance/routes/admin.attendance.routes';
import { publicAttendanceRoutes } from './modules/attendance/routes/public.attendance.routes';
import { publicReportsRoutes } from './modules/reports/routes/public.reports.routes';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function buildServer(): Promise<FastifyInstance> {
    const server = Fastify({
        logger: {
            level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
        },
    });

    // Register plugins
    await registerSecurityPlugins(server);
    await registerDatabasePlugin(server);
    await registerAuthPlugin(server);
    await registerSwaggerPlugin(server);

    // Health check
    server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    // Public API routes (no auth required for some endpoints)
    await server.register(async (publicApi) => {
        await publicApi.register(authRoutes, { prefix: '/auth' });
        await publicApi.register(publicUsersRoutes, { prefix: '/users' });

        await publicApi.register(publicAttachmentsRoutes, { prefix: '/attachments' });
        await publicApi.register(publicGradesRoutes, { prefix: '/grades' });
        await publicApi.register(publicAttendanceRoutes, { prefix: '/attendance' });
        await publicApi.register(publicReportsRoutes, { prefix: '/reports' });
        await publicApi.register(publicLessonsRoutes, { prefix: '/lessons' });
        await publicApi.register(publicCoursesRoutes, { prefix: '/courses' });
        await publicApi.register(publicEnrollmentsRoutes, { prefix: '/enrollments' });
        await publicApi.register(publicQuizzesRoutes, { prefix: '/quizzes' });
        await publicApi.register(publicProgressRoutes, { prefix: '/progress' });
    }, { prefix: '/api/v1' });

    await server.register(async (adminApi) => {
        await adminApi.register(adminUsersRoutes, { prefix: '/users' });
        await adminApi.register(adminSchoolsRoutes, { prefix: '/schools' });
        await adminApi.register(adminClassesRoutes, { prefix: '/classes' });
        await adminApi.register(adminRolesRoutes, { prefix: '/roles' });
        await adminApi.register(adminCoursesRoutes, { prefix: '/courses' });
        await adminApi.register(adminLessonsRoutes, { prefix: '/lessons' });
        await adminApi.register(adminQuizzesRoutes, { prefix: '/quizzes' });
        await adminApi.register(adminEnrollmentsRoutes, { prefix: '/enrollments' });
        await adminApi.register(adminAttachmentsRoutes, { prefix: '/attachments' });
        await adminApi.register(adminGradesRoutes, { prefix: '/grades' });
        await adminApi.register(adminAttendanceRoutes, { prefix: '/attendance' });
    }, { prefix: '/api/admin' });

    return server;
}

async function start() {
    try {
        const server = await buildServer();
        await server.listen({ port: PORT, host: HOST });
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
        console.log(`📚 API Docs at http://${HOST}:${PORT}/documentation`);
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
