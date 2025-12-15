# HUST - Software Development Management - 2026.1 - GROUP 1

## Mini E-Learning Platform

A web-based e-learning platform where students can enroll in courses, watch lessons, take quizzes, and track progress, while teachers manage course content and admins manage the system.

## I. Features

### 1. User Authentication (Login / Signup / Roles)

**Frontend Tasks:**

- Signup + Login page
- Role selection UI (Student / Teacher)
- Form validation
- Show login errors

**Backend Tasks:**

- User registration API
- Password hashing
- Login authentication (JWT/session)
- Role stored in database
- Complexity: Medium but manageable
- Database Tables: Users

### 2. Course Management (Teacher Creates Courses)

**Frontend Tasks:**

- "Create Course" form
- Course list page
- Course detail page
- Upload thumbnail

**Backend Tasks:**

- Create / edit / delete course API
- Store course data and thumbnail
- Serve course list
- Authorization check (only teacher can create)
- Database Tables: Courses, Users

### 3. Lesson Content (Videos or PDFs)

**Frontend Tasks:**

- Lesson list UI
- Video or PDF player
- Next/previous navigation
- Responsive layout

**Backend Tasks:**

- CRUD API for lessons
- Upload videos/PDFs
- Link lessons to courses
- Serve media files
- Database Tables: Lessons, Courses

### 4. Quiz System

**Frontend Tasks:**

- Quiz page showing questions
- Select answers UI
- Submit answers
- Show score/results

**Backend Tasks:**

- CRUD for quiz questions
- Auto-grading answers
- Store student attempts
- Return score to frontend
- Database Tables: Quizzes, Questions, Answers, Attempts

### 5. Student Enrollment + Progress Tracking

**Frontend Tasks:**

- "Enroll" button
- Enrolled courses dashboard
- Progress bar per course
- Lesson completion checkboxes

**Backend Tasks:**

- API to enroll student
- Track completed lessons
- Calculate progress %
- Return progress data
- Database Tables: Enrollments, Progress

### 6. Admin Dashboard

**Frontend Tasks:**

- Admin dashboard page
- List all users
- List all courses
- Ban/unban user UI
- Delete/report course UI

**Backend Tasks:**

- Admin-only endpoints
- User management API
- Course management API
- Basic statistics (total students, courses)
- Database Tables: Users, Courses, Logs

## II. Group member

| No. | Full Name         | Email                          | Student ID | Roles                                         |
| --: | ----------------- | ------------------------------ | ---------- | --------------------------------------------- |
|   1 | Vũ Trần Bách      | bach.vt210090@sis.hust.edu.vn  | 20210090   | Dev. (Authentication)                         |
|   2 | Vũ Đức Minh       | minh.vd215226@sis.hust.edu.vn  | 20215226   | Dev. (Authentication) + Slides + Presentation |
|   3 | Võ Phú Lộc        | loc.vp215221@sis.hust.edu.vn   | 20215221   | Dev. (Lesson Content)                         |
|   4 | Nguyễn Tấn Dũng   | dung.nt215186@sis.hust.edu.vn  | 20215186   | Dev. (Quiz system)                            |
|   5 | Phạm Trường Sang  | sang.pt225996@sis.hust.edu.vn  | 20225996   | Dev. (Admin Dashboard)                        |
|   6 | Đoàn Tiến Dũng    | dung.dt220072@sis.hust.edu.vn  | 20220072   | Dev. (Admin Dashboard)                        |
|   7 | Đinh Xuân Toàn    | toan.dx226067@sis.hust.edu.vn  | 20226067   | Dev. (Course Management)                      |
|   8 | Nguyễn Công Huân  | huan.nc225974@sis.hust.edu.vn  | 20225974   | Dev. (Lesson Content)                         |
|   9 | Trần Huy Hoàng    | hoang.th225973@sis.hust.edu.vn | 20225973   | Dev. (Course Management)                      |
|  10 | Nguyễn Hữu Phúc   | phuc.nh215234@sis.hust.edu.vn  | 20215234   | Dev. (Quiz system)                            |
|  11 | Nguyễn Thanh Tùng | tung.nt226071@sis.hust.edu.vn  | 20226071   | Dev. (Student Enrollment, Progress)           |
|  12 | Phạm Trung Hiếu   | hieu.pt215205@sis.hust.edu.vn  | 20215205   | Setup and review code, Report                 |
|  13 | Nguyễn Đình Phúc  | phuc.nd226062@sis.hust.edu.vn  | 20226062   | Dev. (Student Enrollment, Progress)           |

## III. Installation guide

### 1. Backend

- **Prerequisites:** Node.js 20+, pnpm 9+, PostgreSQL 14+ (local or remote instance).
- **Install dependencies:**

```powershell
cd server
pnpm install
```

- **Configure environment variables:** create a `.env` file in `server` with the values your deployment needs. A minimal local setup looks like:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elearning"
JWT_SECRET="super-secret-key"
JWT_REFRESH_EXPIRES_IN=2592000
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

- **Provision the database:**

```powershell
pnpm prisma:generate
pnpm prisma:migrate
```

- **Run the API in watch mode:**

```powershell
pnpm dev
```

### 2. Frontend

- **Prerequisites:** Node.js 20+, pnpm 9+.
- **Install dependencies:**

```powershell
cd web
pnpm install
```

- **Configure environment variables:** add a `.env` file in `web` (Vite loads `VITE_` prefixed variables). Example:

```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

- **Start the development server:**

```powershell
pnpm dev
```

### 3. Run full stack locally

1. Start PostgreSQL and ensure the database in `DATABASE_URL` exists.
2. Launch the backend with `pnpm dev` under `server`.
3. Launch the frontend with `pnpm dev` under `web`; the app is available at http://localhost:5173.

## IV. Conventions

### A. Commit Rules

#### 1. Commit message convention

Follow the Conventional Commits format:

```
<type>(<scope>): <message>
```

**Example:**

```
feat(vm): add GPU claim logic for KubeVirt
fix(db): correct foreign key constraint for vm_data_disks
refactor(api): simplify ProvisioningHandler flow
docs(readme): update deployment example
```

**Common types:**

| Type       | Meaning                                              |
| ---------- | ---------------------------------------------------- |
| `feat`     | Add a new feature                                    |
| `fix`      | Address a bug                                        |
| `refactor` | Improve code without changing behaviour              |
| `perf`     | Optimise performance                                 |
| `docs`     | Update documentation                                 |
| `test`     | Add or adjust tests                                  |
| `chore`    | Maintenance tasks (CI, build, dependency updates, …) |
| `revert`   | Revert a previous commit                             |

#### 2. Commit content rules

- Keep each commit focused on one logical change.
- Keep the first line ≤ 72 characters; add details in the body, including which feature or ticket it supports.
- Ensure the repo builds and tests pass before pushing.
- Do not commit build artefacts or vendor folders (target/, dist/, node_modules/, .idea/, .vscode/, .env, …).
- Never commit secrets (tokens, passwords, private keys).
- Aim to keep each commit within ~200 lines of changes.

### B. Pull Request Rules

#### 1. PR workflow

- **Base branch:** `main`
- **Feature branch naming:**
  - `feature/<ticket-id>-<short-desc>`
  - `fix/<ticket-id>-<short-desc>`
  - `hotfix/<ticket-id>-<short-desc>`

Example: `feature/UC-1761-add-vm-deletion-api`

#### 2. PR description template

Include the following sections:

**2.1 Description**

- Summarise the purpose and context of the change.

**2.2 Type of change**

- [x] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] CI/CD

**2.3 How to test**

- List verification steps (API calls, UI flows, scripts, …).

#### 3. PR quality requirements

- Keep PRs small and scoped (≤ ~400 lines of changes).
- Ensure CI/CD passes (build, test, lint, coverage).
- Provide unit tests or integration tests where applicable.
