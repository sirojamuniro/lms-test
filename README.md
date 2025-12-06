# LMS Genius

Learning Management System (LMS) yang dibangun dengan NestJS, Fastify, TypeORM, dan implementasi Role-Based Access Control (RBAC) yang lengkap.

## 🚀 Fitur Utama

- ✅ **Authentication & Authorization**: JWT-based authentication dengan role-based access control
- ✅ **User Management**: Multi-role system (Admin, Instructor, Student, Guest)
- ✅ **Course Management**: Lengkap dengan status, pricing, dan metadata
- ✅ **Lesson Management**: Hierarchical lesson structure dengan progress tracking
- ✅ **Polymorphic Attachments**: Sistem attachment fleksibel untuk berbagai entity types
- ✅ **Enrollment System**: Manajemen enrollment dengan status tracking
- ✅ **Progress Tracking**: Real-time progress tracking untuk setiap lesson
- ✅ **Assignment & Quiz**: Sistem penugasan dan kuis lengkap
- ✅ **File Upload**: Support berbagai tipe file (video, image, document, dll)
- ✅ **TypeORM**: Database ORM dengan MySQL support

## 📋 Prerequisites

- Node.js 18+
- MySQL 8+
- npm atau yarn

## 🛠️ Installation

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
```

Edit `.env` file dengan konfigurasi database Anda:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=lms_genius
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=3000
```

4. **Start development server**
```bash
npm run start:dev
```

Server akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
src/
├── common/              # Shared utilities, guards, decorators
├── config/             # Configuration files
├── modules/            # Feature modules
│   ├── auth/          # Authentication
│   ├── users/         # User management
│   ├── courses/       # Course management
│   ├── lessons/       # Lesson management
│   ├── attachments/   # File attachments (polymorphic)
│   ├── enrollments/   # Course enrollment
│   ├── progress/      # Progress tracking
│   ├── assignments/   # Assignment management
│   ├── quizzes/       # Quiz management
│   ├── announcements/ # Announcements
│   └── discussions/   # Discussions
└── main.ts            # Application entry point
```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts dengan role-based access
- **courses**: Course management dengan status dan metadata
- **lessons**: Lesson content dengan hierarchical structure
- **attachments**: Polymorphic file attachments
- **enrollments**: Course enrollment tracking
- **progress**: Learning progress tracking
- **assignments**: Assignment management
- **quizzes**: Quiz system dengan questions dan attempts
- **announcements**: Course announcements
- **discussions**: Discussion forum

Lihat [WORKFLOW.md](./WORKFLOW.md) untuk dokumentasi lengkap tentang database schema dan workflow.

## 🔐 Role-Based Access Control

### Roles

1. **ADMIN**: Full access ke semua resources
2. **INSTRUCTOR**: Dapat membuat/mengelola courses, lessons, assignments
3. **STUDENT**: Dapat enroll, view lessons, submit assignments
4. **GUEST**: Limited read-only access

### Usage Example

```typescript
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() createCourseDto: CreateCourseDto) {
    // Only Admin and Instructor can create courses
  }
}
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login

### Courses
- `GET /courses` - List courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (Admin, Instructor)
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Lessons
- `GET /lessons` - List lessons
- `GET /lessons/:id` - Get lesson details
- `POST /lessons` - Create lesson
- `PATCH /lessons/:id` - Update lesson
- `DELETE /lessons/:id` - Delete lesson

### Attachments
- `POST /attachments/upload` - Upload file (multipart/form-data)
- `GET /attachments` - List attachments
- `GET /attachments/:id` - Get attachment details
- `DELETE /attachments/:id` - Delete attachment

### Enrollments
- `POST /enrollments` - Enroll in course
- `GET /enrollments` - List enrollments
- `GET /enrollments/my-enrollments` - Get my enrollments
- `PATCH /enrollments/:id/status` - Update enrollment status

### Progress
- `POST /progress` - Create/update progress
- `GET /progress/my-progress` - Get my progress
- `PATCH /progress/:id` - Update progress

## 📎 Polymorphic Attachment System

Sistem attachment menggunakan polymorphic relation untuk fleksibilitas maksimal. Satu attachment dapat terhubung ke berbagai entity types:

- Course
- Lesson
- Assignment
- Quiz
- Announcement
- Discussion

### Upload Example

```bash
curl -X POST http://localhost:3000/attachments/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "entityType=Course" \
  -F "entityId=1" \
  -F "courseId=1"
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint

## 🔧 Database Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 📚 Dokumentasi Lengkap

Lihat [WORKFLOW.md](./WORKFLOW.md) untuk dokumentasi lengkap tentang:
- Arsitektur sistem
- Database schema detail
- Role-based access control
- API endpoints
- Workflow examples
- Best practices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Dibangun dengan ❤️ menggunakan NestJS, Fastify, dan TypeORM
