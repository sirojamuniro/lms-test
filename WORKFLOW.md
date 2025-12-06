# LMS Genius - Workflow Documentation

## Overview
Sistem Learning Management System (LMS) yang dibangun dengan NestJS, Fastify, TypeORM, dan implementasi Role-Based Access Control (RBAC).

## Arsitektur Sistem

### Teknologi Stack
- **Framework**: NestJS dengan Fastify adapter
- **Database**: MySQL dengan TypeORM
- **Authentication**: JWT dengan Passport
- **Authorization**: Role-Based Access Control (RBAC)
- **File Upload**: Fastify Multipart

### Struktur Folder

```
src/
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators (@Roles, @Public)
│   ├── guards/              # Authentication & Authorization guards
│   ├── enums/               # Enumerations (UserRole, AttachmentType, dll)
│   └── interfaces/          # TypeScript interfaces
├── config/                  # Configuration files
│   ├── database.config.ts   # TypeORM data source config
│   └── typeorm.config.ts    # TypeORM module config
├── modules/                 # Feature modules
│   ├── auth/               # Authentication module
│   ├── users/              # User management
│   ├── courses/            # Course management
│   ├── lessons/            # Lesson management
│   ├── attachments/        # File attachment (polymorphic)
│   ├── enrollments/        # Course enrollment
│   ├── progress/           # Learning progress tracking
│   ├── assignments/        # Assignment management
│   ├── quizzes/            # Quiz management
│   ├── announcements/      # Course announcements
│   └── discussions/        # Discussion forum
└── main.ts                 # Application entry point
```

## Database Schema

### Core Entities

#### 1. User Entity
- **Tabel**: `users`
- **Fields**: id, email, username, password, firstName, lastName, phone, avatar, role, isActive, bio, metadata
- **Relations**: 
  - One-to-Many: courses (as instructor)
  - One-to-Many: enrollments (as student)
  - One-to-Many: progress

#### 2. Course Entity
- **Tabel**: `courses`
- **Fields**: id, title, description, shortDescription, thumbnail, status, price, duration, totalLessons, totalStudents, rating, totalRatings, tags, learningObjectives, requirements, instructorId
- **Relations**:
  - Many-to-One: instructor (User)
  - One-to-Many: lessons
  - One-to-Many: enrollments
  - One-to-Many: attachments

#### 3. Lesson Entity
- **Tabel**: `lessons`
- **Fields**: id, title, description, content, order, duration, status, videoUrl, courseId
- **Relations**:
  - Many-to-One: course
  - One-to-Many: attachments
  - One-to-Many: progress

#### 4. Attachment Entity (Polymorphic)
- **Tabel**: `attachments`
- **Fields**: id, filename, originalFilename, filePath, mimeType, fileSize, type, entityType, entityId, courseId, lessonId, uploadedById
- **Polymorphic Relations**: 
  - `entityType` + `entityId` untuk fleksibilitas
  - Direct relations: course, lesson (optional untuk query yang lebih mudah)
- **Types**: file, video, image, audio, document, pdf, presentation, spreadsheet, other

#### 5. Enrollment Entity
- **Tabel**: `enrollments`
- **Fields**: id, status, pricePaid, enrolledAt, completedAt, studentId, courseId
- **Relations**:
  - Many-to-One: student (User)
  - Many-to-One: course
  - One-to-Many: progress

#### 6. Progress Entity
- **Tabel**: `progress`
- **Fields**: id, status, completionPercentage, timeSpent, lastAccessedAt, completedAt, userId, lessonId, enrollmentId
- **Relations**:
  - Many-to-One: user
  - Many-to-One: lesson
  - Many-to-One: enrollment (optional)

#### 7. Assignment Entity
- **Tabel**: `assignments`
- **Fields**: id, title, description, instructions, dueDate, maxScore, isActive, courseId, lessonId
- **Relations**:
  - Many-to-One: course (optional)
  - Many-to-One: lesson (optional)
  - One-to-Many: submissions

#### 8. Quiz Entity
- **Tabel**: `quizzes`
- **Fields**: id, title, description, timeLimit, maxScore, maxAttempts, isActive, courseId, lessonId
- **Relations**:
  - Many-to-One: course (optional)
  - Many-to-One: lesson (optional)
  - One-to-Many: questions
  - One-to-Many: attempts

## Role-Based Access Control (RBAC)

### Roles
1. **ADMIN**: Full access to all resources
2. **INSTRUCTOR**: Can create/manage courses, lessons, assignments, quizzes
3. **STUDENT**: Can enroll in courses, view lessons, submit assignments/quizzes
4. **GUEST**: Limited read-only access

### Guards Implementation

#### JwtAuthGuard
- Validates JWT token
- Can be bypassed with `@Public()` decorator
- Attaches user info to request object

#### RolesGuard
- Checks user role against required roles
- Used with `@Roles()` decorator
- Example: `@Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)`

### Permission Matrix

| Resource | Admin | Instructor | Student | Guest |
|----------|-------|------------|---------|-------|
| View Courses | ✅ | ✅ | ✅ (published only) | ✅ (published only) |
| Create Course | ✅ | ✅ | ❌ | ❌ |
| Update Course | ✅ | ✅ (own) | ❌ | ❌ |
| Delete Course | ✅ | ✅ (own) | ❌ | ❌ |
| Create Lesson | ✅ | ✅ (own course) | ❌ | ❌ |
| View Lessons | ✅ | ✅ | ✅ (enrolled) | ❌ |
| Enroll Course | ✅ | ❌ | ✅ | ❌ |
| View Progress | ✅ | ✅ (own courses) | ✅ (own) | ❌ |
| Upload Attachment | ✅ | ✅ | ❌ | ❌ |

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user (Public)
- `POST /auth/login` - Login (Public)

### Users
- `GET /users` - List all users (Admin, Instructor)
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user by ID (Admin, Instructor)
- `PATCH /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)

### Courses
- `GET /courses` - List courses (filtered by role)
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (Admin, Instructor)
- `PATCH /courses/:id` - Update course (Admin, Instructor - own)
- `DELETE /courses/:id` - Delete course (Admin, Instructor - own)

### Lessons
- `GET /lessons` - List lessons (optional courseId filter)
- `GET /lessons/:id` - Get lesson details
- `POST /lessons` - Create lesson (Admin, Instructor)
- `PATCH /lessons/:id` - Update lesson (Admin, Instructor - own course)
- `DELETE /lessons/:id` - Delete lesson (Admin, Instructor - own course)

### Attachments
- `POST /attachments/upload` - Upload file (multipart/form-data)
- `GET /attachments` - List attachments (optional entityType/entityId filter)
- `GET /attachments/:id` - Get attachment details
- `DELETE /attachments/:id` - Delete attachment

### Enrollments
- `POST /enrollments` - Enroll in course (Student, Admin)
- `GET /enrollments` - List enrollments (Admin, Instructor)
- `GET /enrollments/my-enrollments` - Get my enrollments
- `GET /enrollments/:id` - Get enrollment details
- `PATCH /enrollments/:id/status` - Update enrollment status (Admin, Instructor)
- `DELETE /enrollments/:id` - Delete enrollment (Admin)

### Progress
- `POST /progress` - Create/update progress (Student, Admin)
- `GET /progress` - List progress (Admin, Instructor)
- `GET /progress/my-progress` - Get my progress
- `GET /progress/:id` - Get progress details
- `PATCH /progress/:id` - Update progress (Student, Admin)
- `DELETE /progress/:id` - Delete progress (Admin)

## Polymorphic Attachment System

### Concept
Attachment entity menggunakan polymorphic relation untuk fleksibilitas maksimal. Satu attachment dapat terhubung ke berbagai entity types:

- Course
- Lesson
- Assignment
- Quiz
- Announcement
- Discussion

### Implementation
```typescript
// Attachment entity memiliki:
- entityType: EntityType enum
- entityId: number
- Optional direct relations (courseId, lessonId) untuk query yang lebih mudah
```

### Usage Example
```typescript
// Upload attachment untuk course
POST /attachments/upload
FormData:
  - file: [file]
  - entityType: "Course"
  - entityId: 1
  - courseId: 1

// Upload attachment untuk lesson
POST /attachments/upload
FormData:
  - file: [file]
  - entityType: "Lesson"
  - entityId: 5
  - courseId: 1
  - lessonId: 5
```

## Workflow Examples

### 1. Course Creation Workflow
1. Instructor/Admin login
2. Create course via `POST /courses`
3. Add lessons via `POST /lessons`
4. Upload course materials via `POST /attachments/upload`
5. Publish course (update status to 'published')

### 2. Student Enrollment Workflow
1. Student login
2. Browse published courses via `GET /courses`
3. Enroll in course via `POST /enrollments`
4. Access lessons via `GET /lessons?courseId=X`
5. Track progress via `POST /progress`

### 3. File Upload Workflow
1. Authenticated user (with permission) uploads file
2. System determines file type from mime type
3. File saved to `/uploads` directory
4. Attachment record created with polymorphic relation
5. File accessible via attachment ID

## Setup & Installation

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm atau yarn

### Installation Steps

1. **Clone repository**
```bash
git clone <repository-url>
cd lms-test
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
```

4. **Run database migrations** (optional, jika menggunakan migrations)
```bash
npm run migration:run
```

5. **Start development server**
```bash
npm run start:dev
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=lms_genius
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

## Best Practices

1. **Security**
   - Always use JWT authentication
   - Validate user permissions with RolesGuard
   - Use @Public() decorator sparingly
   - Hash passwords with bcrypt
   - Validate all inputs with class-validator

2. **Database**
   - Use transactions for complex operations
   - Index frequently queried columns
   - Use soft deletes where appropriate
   - Optimize queries with proper relations

3. **File Upload**
   - Validate file types and sizes
   - Store files outside public directory
   - Use unique filenames to prevent conflicts
   - Clean up orphaned files

4. **Code Organization**
   - Keep modules focused and cohesive
   - Use DTOs for data validation
   - Separate business logic in services
   - Use guards for cross-cutting concerns

## Future Enhancements

- [ ] Add email notifications
- [ ] Implement real-time notifications (WebSocket)
- [ ] Add course categories and tags
- [ ] Implement course certificates
- [ ] Add payment integration
- [ ] Implement advanced search
- [ ] Add analytics and reporting
- [ ] Implement course reviews and ratings
- [ ] Add discussion forum features
- [ ] Implement video streaming


