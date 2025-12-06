import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { classesService } from '../classes.service';
import { ResponseHelper } from '../../../helpers/response.helper';
import { requireUserTypes } from '../../../plugins/auth.plugin';
import { UserType } from '../../../entities/user.entity';
import {
    createClassSchema,
    updateClassSchema,
    deleteClassSchema,
    manageStudentClassSchema
} from '../classes.schemas';

export async function adminClassesRoutes(server: FastifyInstance) {
    server.addHook('preHandler', server.authenticate);

    // Create class (Admin/School Admin)
    server.post('/', {
        schema: createClassSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;

        // Force schoolId for School Admin
        if (request.user.userType === UserType.SCHOOL_ADMIN) {
            body.schoolId = request.user.schoolId;
        }

        try {
            const cls = await classesService.create(body);
            ResponseHelper.created(reply, cls);
        } catch (error: any) {
            if (error.statusCode === 409) return ResponseHelper.conflict(reply, error.message);
            throw error;
        }
    });

    // Update class
    server.put('/:id', {
        schema: updateClassSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const cls = await classesService.findById(id);

        if (!cls) return ResponseHelper.notFound(reply, 'Class');

        if (request.user.userType === UserType.SCHOOL_ADMIN && cls.schoolId !== request.user.schoolId) {
            return ResponseHelper.forbidden(reply);
        }

        const updated = await classesService.update(id, request.body as any);
        ResponseHelper.success(reply, updated);
    });

    // Delete class
    server.delete('/:id', {
        schema: deleteClassSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: number };
        const cls = await classesService.findById(id);
        if (!cls) return ResponseHelper.notFound(reply, 'Class');

        if (request.user.userType === UserType.SCHOOL_ADMIN && cls.schoolId !== request.user.schoolId) {
            return ResponseHelper.forbidden(reply);
        }

        const deleted = await classesService.delete(id);
        ResponseHelper.success(reply, null, 200, 'Class deleted');
    });

    // Add student to class
    server.post('/:id/students/:studentId', {
        schema: manageStudentClassSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id, studentId } = request.params as { id: number; studentId: number };
        const cls = await classesService.findById(id);
        if (!cls) return ResponseHelper.notFound(reply, 'Class');

        if (request.user.userType === UserType.SCHOOL_ADMIN && cls.schoolId !== request.user.schoolId) {
            return ResponseHelper.forbidden(reply);
        }

        await classesService.addStudent(id, studentId);
        ResponseHelper.success(reply, null, 200, 'Student added to class');
    });

    // Remove student from class
    server.delete('/:id/students/:studentId', {
        schema: manageStudentClassSchema,
        preHandler: [requireUserTypes(UserType.SUPER_ADMIN, UserType.SCHOOL_ADMIN)],
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id, studentId } = request.params as { id: number; studentId: number };
        const cls = await classesService.findById(id);
        if (!cls) return ResponseHelper.notFound(reply, 'Class');

        if (request.user.userType === UserType.SCHOOL_ADMIN && cls.schoolId !== request.user.schoolId) {
            return ResponseHelper.forbidden(reply);
        }

        await classesService.removeStudent(id, studentId);
        ResponseHelper.success(reply, null, 200, 'Student removed from class');
    });
}
