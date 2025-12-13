-- DropIndex
DROP INDEX "lessons_courseId_idx";

-- DropIndex
DROP INDEX "lessons_order_idx";

-- CreateIndex
CREATE INDEX "lessons_courseId_order_idx" ON "lessons"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_courseId_order_key" ON "lessons"("courseId", "order");

