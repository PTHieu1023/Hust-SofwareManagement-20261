# HUST - Software Development Management - 2026.1 - GROUP 1

## Mini E-Learning Platform

Students can browse courses, enroll, watch lessons, submit quizzes, etc.

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

## II. Conventions

### A. Commit Rules

#### 1. Quy tắc đặt tên commit (Commit message convention)

Theo chuẩn Conventional Commits:

```
<type>(<scope>): <message>
```

**Ví dụ:**

```
feat(vm): add GPU claim logic for KubeVirt
fix(db): correct foreign key constraint for vm_data_disks
refactor(api): simplify ProvisioningHandler flow
docs(readme): update example of deployment
```

**Các type phổ biến:**

| Type | Ý nghĩa |
|------|---------|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Cải thiện code không đổi behavior |
| `perf` | Tối ưu hiệu năng |
| `docs` | Cập nhật tài liệu |
| `test` | Thêm/chỉnh test |
| `chore` | Thay đổi phụ (CI, build, dep update, v.v.) |
| `revert` | Hoàn tác commit trước đó |

#### 2. Quy tắc nội dung commit

- Mỗi commit chỉ nên làm một việc rõ ràng.
- Message ≤ 72 ký tự ở dòng đầu, thêm chi tiết ở phần mô tả, cần đề cập tới commit này phục vụ phát triển cho tính năng nào trong danh sách tính năng triển khai.
- Commit phải build được, test pass trước khi push.
- Không commit file build (`target/`, `dist/`, `node_modules/`, `.idea/`, `.vscode/`, `.env`, v.v.).
- Không commit thông tin nhạy cảm (token, mật khẩu, private key).
- Một commit nên giới hạn trong khoảng 200 dòng code thay đổi.

### B. Pull Request Rules

#### 1. Quy trình tạo PR

- **Base branch:** `main`
- **Feature branch name:** theo định dạng:
  - `feature/<ticket-id>-<short-desc>`
  - `fix/<ticket-id>-<short-desc>`
  - `hotfix/<ticket-id>-<short-desc>`
  
Ví dụ: `feature/UC-1761-add-vm-deletion-api`

#### 2. Nội dung mô tả PR

PR description phải gồm:

**2.1 Description**

- Tóm tắt thay đổi (mục đích, lý do)

**2.2 Type of change**

- [x] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] CI/CD

**2.3 How to test**

- Các bước kiểm thử (VD: gọi API, ...)

#### 3. Yêu cầu về Pull Request

- PR nhỏ, rõ chức năng (≤ ~400 dòng code thay đổi).
- Đảm bảo CI/CD pass (build, test, lint, coverage).
- Có unit test hoặc integration test.
