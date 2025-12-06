import 'reflect-metadata';
import { config } from 'dotenv';
import { AppDataSource } from '../../plugins/database.plugin';
import { seedPermissions } from './seed-permissions';
import { seedRoles } from './seed-roles';
import { seedUsers } from './seed-users';
import { seedSchools } from './seed-schools';
import { seedDummyUsers } from './seed-dummy-users';
import { seedClasses } from './seed-classes';
import { seedCoursesAndLessons } from './seed-courses';
import { seedEnrollments } from './seed-enrollments';
import { seedGrades } from './seed-grades';
import { seedAttendance } from './seed-attendance';

// Load env vars
config();

async function runSeeds() {
    try {
        console.log('🔄 Connecting to database...');
        await AppDataSource.initialize();

        console.log('🚀 Starting seeds...');
        await seedPermissions();
        await seedRoles();
        await seedUsers();
        await seedSchools();
        await seedDummyUsers();
        await seedClasses();
        await seedCoursesAndLessons();
        await seedEnrollments();
        await seedGrades();
        await seedAttendance();

        console.log('🏁 All seeds completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

runSeeds();
