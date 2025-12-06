import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Course } from './course.entity';
import { Enrollment } from './enrollment.entity';
import { Progress } from './progress.entity';
import { School } from './school.entity';
import { Class } from './class.entity';
import { UserRole as UserRoleEntity } from './user-role.entity';

/**
 * Legacy user roles (kept for backward compatibility, will be replaced by dynamic roles)
 */
export enum UserType {
    SUPER_ADMIN = 'super_admin',     // LMS System Admin
    FOUNDATION_ADMIN = 'foundation_admin', // Yayasan Admin
    SCHOOL_ADMIN = 'school_admin',   // Admin Sekolah
    PRINCIPAL = 'principal',          // Kepala Sekolah
    STAFF = 'staff',                 // Tata Usaha
    TEACHER = 'teacher',             // Guru
    STUDENT = 'student',             // Siswa
    PARENT = 'parent',               // Orang Tua
}

/**
 * User entity - supports multi-school and dynamic RBAC
 */
@Entity('users')
@Index(['email'], { unique: true })
@Index(['nis'])
@Index(['nip'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Email (unique, used for login)
     */
    @Column({ unique: true })
    email: string;

    /**
     * Username (optional)
     */
    @Column({ unique: true, nullable: true })
    username: string;

    /**
     * Hashed password
     */
    @Column({ select: false })
    password: string;

    /**
     * First name
     */
    @Column()
    firstName: string;

    /**
     * Last name
     */
    @Column()
    lastName: string;

    /**
     * Phone number
     */
    @Column({ nullable: true })
    phone: string;

    /**
     * Avatar URL
     */
    @Column({ nullable: true })
    avatar: string;

    /**
     * Legacy role type (for backward compatibility)
     * Will be deprecated in favor of dynamic roles
     */
    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.STUDENT,
    })
    userType: UserType;

    /**
     * Whether user is active
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Admission Score (Nilai Masuk)
     */
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    admissionScore: number;

    /**
     * User biography/description
     */
    @Column({ type: 'text', nullable: true })
    bio: string;

    // =========================================
    // School-specific fields
    // =========================================

    /**
     * NIS - Nomor Induk Siswa (for students)
     */
    @Column({ nullable: true })
    nis: string;

    /**
     * NIP - Nomor Induk Pegawai (for teachers/staff)
     */
    @Column({ nullable: true })
    nip: string;

    /**
     * NISN - Nomor Induk Siswa Nasional
     */
    @Column({ nullable: true })
    nisn: string;

    /**
     * Date of birth
     */
    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    /**
     * Gender
     */
    @Column({ nullable: true })
    gender: string; // 'male' | 'female'

    /**
     * Address
     */
    @Column({ type: 'text', nullable: true })
    address: string;

    /**
     * Primary school (for quick access)
     */
    @Column({ nullable: true })
    primarySchoolId: number;

    @ManyToOne(() => School, { nullable: true })
    @JoinColumn({ name: 'primarySchoolId' })
    primarySchool: School;

    // =========================================
    // SSO Fields
    // =========================================

    @Column({ nullable: true })
    ssoProvider: string;

    @Column({ nullable: true })
    ssoId: string;

    @Column({ nullable: true, select: false })
    refreshToken: string;

    // =========================================
    // Additional data
    // =========================================

    /**
     * Additional metadata (flexible storage)
     */
    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    /**
     * Last login timestamp
     */
    @Column({ nullable: true })
    lastLoginAt: Date;

    /**
     * Class (for students)
     */
    @Column({ nullable: true })
    classId: number;

    @ManyToOne(() => Class, (cls) => cls.students, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'classId' })
    class: Class;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // =========================================
    // Relations
    // =========================================

    /**
     * Dynamic roles (via UserRole pivot)
     */
    @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
    userRoles: UserRoleEntity[];

    /**
     * Courses created by this user (as instructor)
     */
    @OneToMany(() => Course, (course) => course.instructor)
    courses: Course[];

    /**
     * Enrollments (as student)
     */
    @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
    enrollments: Enrollment[];

    /**
     * Progress records
     */
    @OneToMany(() => Progress, (progress) => progress.user)
    progress: Progress[];

    // =========================================
    // Helper methods
    // =========================================

    /**
     * Get full name
     */
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    /**
     * Check if user has a specific role in a school
     */
    hasRoleInSchool(roleName: string, schoolId: number): boolean {
        return this.userRoles?.some(
            ur => ur.role?.name === roleName && ur.schoolId === schoolId && ur.isActive
        ) ?? false;
    }

    /**
     * Check if user has a global role
     */
    hasGlobalRole(roleName: string): boolean {
        return this.userRoles?.some(
            ur => ur.role?.name === roleName && !ur.schoolId && ur.isActive
        ) ?? false;
    }

    /**
     * Get all permissions for a specific school
     */
    getPermissionsForSchool(schoolId: number): string[] {
        const permissions: string[] = [];
        this.userRoles?.forEach(ur => {
            if ((ur.schoolId === schoolId || !ur.schoolId) && ur.isActive) {
                ur.role?.permissions?.forEach(p => permissions.push(p.name));
            }
        });
        return [...new Set(permissions)];
    }
}
