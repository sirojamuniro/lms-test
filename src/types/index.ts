/**
 * Re-export UserType from User entity for compatibility
 */
export { UserType } from '../entities/user.entity';

/**
 * Legacy UserRole - kept for backward compatibility
 * @deprecated Use UserType from user.entity.ts instead
 */
export enum UserRole {
    ADMIN = 'admin',
    INSTRUCTOR = 'instructor',
    STUDENT = 'student',
    GUEST = 'guest',
}

/**
 * Attachment types
 */
export enum AttachmentType {
    FILE = 'file',
    VIDEO = 'video',
    IMAGE = 'image',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    PDF = 'pdf',
    PRESENTATION = 'presentation',
    SPREADSHEET = 'spreadsheet',
    OTHER = 'other',
}

/**
 * Entity types for polymorphic attachments
 */
export enum EntityType {
    COURSE = 'Course',
    LESSON = 'Lesson',
    ASSIGNMENT = 'Assignment',
    QUIZ = 'Quiz',
    ANNOUNCEMENT = 'Announcement',
    DISCUSSION = 'Discussion',
    SCHOOL = 'School',
    CLASS = 'Class',
    SUBJECT = 'Subject',
    USER = 'User',
    GRADE = 'Grade',
    ATTENDANCE = 'Attendance',
}

/**
 * Course status
 */
export enum CourseStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

/**
 * Enrollment status
 */
export enum EnrollmentStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    DROPPED = 'dropped',
}

/**
 * Lesson status
 */
export enum LessonStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    LOCKED = 'locked',
}

/**
 * Progress status
 */
export enum ProgressStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

/**
 * Quiz question types
 */
export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
    SHORT_ANSWER = 'short_answer',
    ESSAY = 'essay',
    FILL_BLANK = 'fill_blank',
}

/**
 * Assignment status
 */
export enum AssignmentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    CLOSED = 'closed',
}

/**
 * Submission status
 */
export enum SubmissionStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
    GRADED = 'graded',
    RETURNED = 'returned',
}

/**
 * JWT payload interface
 */
export interface JwtPayload {
    userId: number;
    email: string;
    userType: string;
    schoolId?: number;
    iat?: number;
    exp?: number;
}

/**
 * Authenticated user interface
 */
export interface AuthenticatedUser {
    userId: number;
    email: string;
    userType: string;
    schoolId?: number;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

/**
 * Filter query for courses
 */
export interface CourseFilterQuery extends PaginationQuery {
    status?: CourseStatus;
    instructorId?: number;
    schoolId?: number;
    search?: string;
    category?: string;
}

/**
 * Filter query for users
 */
export interface UserFilterQuery extends PaginationQuery {
    userType?: string;
    schoolId?: number;
    isActive?: boolean;
    search?: string;
}
