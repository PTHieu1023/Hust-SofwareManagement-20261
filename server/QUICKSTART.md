# 🚀 Backend Server - Quick Start Guide

## ✅ What's Been Created

A **complete Node.js TypeScript backend structure** with:

- ✨ **Clean Architecture** - Controllers → Services → Database
- 📦 **Path Aliases** - Use `@/` imports instead of `../../../`
- 📝 **TODO Placeholders** - All business logic marked for implementation
- 🗄️ **Complete Prisma Schema** - All database models defined
- 🛣️ **All API Routes** - Fully structured with validation
- 🔐 **Auth Middleware** - JWT authentication ready
- 📤 **File Upload** - Multer configuration for videos/PDFs

## 🎯 Import Alias Usage

**Old way:**

```typescript
import { config } from '../../../config';
import authService from '../../services/auth.service';
import { AuthRequest } from '../middleware/auth';
```

**New way:**

```typescript
import { config } from '@/config';
import authService from '@/services/auth.service';
import { AuthRequest } from '@/middleware/auth';
```

## 📂 Key Directories

### `/src/services/` - **YOUR WORK HERE**

Contains all business logic with TODO comments:

- `auth.service.ts` - User registration, login, JWT
- `course.service.ts` - Course CRUD operations
- `lesson.service.ts` - Lesson management
- `quiz.service.ts` - Quiz creation and auto-grading
- `enrollment.service.ts` - Student enrollments
- `progress.service.ts` - Progress tracking
- `admin.service.ts` - Admin operations

### `/src/controllers/` - Thin Layer

Controllers just call service methods and handle HTTP responses.

### `/src/routes/` - API Definitions

All routes with validation rules already set up.

## 🔨 Installation

```bash
# Navigate to server directory
cd server

# Install dependencies (including tsconfig-paths for @ imports)
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/elearning_db"

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
# Lệnh này để tạo các bảng trong CSDL. nếu đã tạo rồi thì không cần chạy nữa (Cẩn thận reset toàn bộ CSDL)
npm run prisma:migrate (optional)

# Start development server
npm run dev
```

## 📝 Implementation Workflow

### 1. **Start with Authentication**

File: `src/services/auth.service.ts`

Implement methods:

- [ ] `register()` - Create user with hashed password
- [ ] `login()` - Validate credentials and return JWT
- [ ] `generateToken()` - Create JWT token
- [ ] `verifyToken()` - Validate JWT token

### 2. **Course Management**

File: `src/services/course.service.ts`

Implement methods:

- [ ] `getAllCourses()` - List with filters
- [ ] `getCourseById()` - Get course details
- [ ] `createCourse()` - Create new course
- [ ] `updateCourse()` - Update course (check ownership)
- [ ] `deleteCourse()` - Delete course
- [ ] `togglePublish()` - Publish/unpublish

### 3. **Continue with Other Services**

Follow the TODO comments in each service file.

## 📖 Documentation Files

- **`PROJECT_STRUCTURE.md`** - Complete architecture overview
- **`IMPLEMENTATION_EXAMPLE.md`** - Detailed implementation guide with examples
- **`README.md`** - General project information

## 🧪 Testing Your API

### Example: Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "username": "student1",
    "password": "password123",
    "fullName": "Test Student",
    "role": "STUDENT"
  }'
```

### Use Prisma Studio for Database

```bash
npm run prisma:studio
# Opens GUI at http://localhost:5555
```

## 📋 Service Implementation Checklist

Each service method has:

- ✅ JSDoc comments explaining what to do
- ✅ Type definitions for parameters and returns
- ✅ TODO comment marking where to implement
- ✅ Error handling structure

Example:

```typescript
/**
 * TODO: Implement user registration
 * - Validate user input
 * - Check if email/username already exists
 * - Hash password using bcrypt
 * - Create user in database
 * - Generate JWT token
 */
async register(data: RegisterDTO): Promise<AuthResult> {
  // TODO: Implement registration logic
  throw new Error('Not implemented');
}
```

## 🎓 Learning Path

1. Read `IMPLEMENTATION_EXAMPLE.md` for detailed patterns
2. Start implementing `auth.service.ts`
3. Test with Postman/cURL
4. Move to next service
5. Commit with: `feat(auth): implement user registration`

## 🚦 Scripts

```bash
npm run dev          # Development with hot reload + path aliases
npm run build        # Compile TypeScript
npm start            # Production server
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database GUI
npm run lint         # Check code quality
npm run format       # Format code
```

## 📦 Project Uses

- **TypeScript** - Type safety
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **Winston** - Logging
- **express-validator** - Input validation

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env` file
3. ✅ Run Prisma migrations
4. 🔨 Implement service methods (start with `auth.service.ts`)
5. 🧪 Test endpoints
6. 📝 Commit following conventions

---

**Everything is ready to go! Just implement the TODO methods in the services directory. The structure, routes, middleware, and database are all set up for you.**
