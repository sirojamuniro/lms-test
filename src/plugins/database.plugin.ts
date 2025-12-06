import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/database.config';

// Create TypeORM DataSource
export const AppDataSource = new DataSource(dataSourceOptions);

// Extend Fastify type
declare module 'fastify' {
    interface FastifyInstance {
        db: DataSource;
    }
}

/**
 * Register TypeORM database connection
 */
export async function registerDatabasePlugin(server: FastifyInstance) {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            server.log.info('Database connection established');
        }

        // Decorate fastify with database instance
        server.decorate('db', AppDataSource);

        // Close database connection on server close
        server.addHook('onClose', async () => {
            if (AppDataSource.isInitialized) {
                await AppDataSource.destroy();
                server.log.info('Database connection closed');
            }
        });
    } catch (error) {
        server.log.error(error, 'Failed to connect to database');
        throw error;
    }
}

/**
 * Get repository helper
 */
export function getRepository<T>(entity: { new(): T }) {
    return AppDataSource.getRepository(entity);
}
