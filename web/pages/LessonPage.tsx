import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { View, Lesson } from "../types";
import { useAuth } from "../context/AuthContext";

type LessonDetailResponse = {
  lesson: Lesson;
  prevLessonId: string | null;
  nextLessonId: string | null;
};

export default function LessonPage({
  courseId,
  lessonId,
  setView,
}: {
  courseId: string;
  lessonId: string;
  setView: (view: View) => void;
}) {
  const { user } = useAuth();

  const [data, setData] = useState<LessonDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      const role = String(user?.role || "").toUpperCase();
      const isTeacherOrAdmin = role === "TEACHER" || role === "ADMIN";

      try {
        const res = (isTeacherOrAdmin
          ? await api.getLessonDetailForTeacher(lessonId)
          : await api.getLessonDetail(lessonId)) as LessonDetailResponse;

        setData(res);
      } catch (err: any) {
        const status = err?.response?.status;
        setError(status ? `Failed to load lesson. (${status})` : "Failed to load lesson.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [lessonId, user?.role]);

  const lesson = data?.lesson;
  const prevId = data?.prevLessonId ?? null;
  const nextId = data?.nextLessonId ?? null;

  const type = useMemo(() => {
    return String(lesson?.type || "").toLowerCase(); // "pdf" | "video"
  }, [lesson?.type]);

  const contentUrl = useMemo(() => {
    const url = lesson?.contentUrl || "";
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    const BASE_URL = "http://localhost:3000";
    return `${BASE_URL}${url}`;
  }, [lesson?.contentUrl]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-slate-300">
        Loading lesson...
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">
          {error || "Lesson not found."}
        </div>
        <button
          onClick={() => setView({ page: "course", id: courseId })}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-700/60 text-slate-100 hover:bg-slate-700"
        >
          ← Back to course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setView({ page: "course", id: courseId })}
          className="px-4 py-2 rounded-lg bg-slate-700/60 text-slate-100 hover:bg-slate-700"
        >
          ← Back
        </button>

        <div className="text-lg md:text-xl font-bold text-white truncate">
          {lesson.title}
        </div>

        <div className="flex gap-2">
          <button
            disabled={!prevId}
            onClick={() => setView({ page: "lesson", courseId, lessonId: prevId! })}
            className="px-4 py-2 rounded-lg bg-slate-700/60 text-slate-100 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            disabled={!nextId}
            onClick={() => setView({ page: "lesson", courseId, lessonId: nextId! })}
            className="px-4 py-2 rounded-lg bg-slate-700/60 text-slate-100 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-4">
        {!contentUrl ? (
          <div className="p-6 text-slate-600 dark:text-slate-300">
            Bài học này chưa có nội dung (contentUrl = null).
          </div>
        ) : type === "video" ? (
          <video
            controls
            src={contentUrl}
            className="w-full max-h-[70vh] rounded-xl bg-black"
          />
        ) : (
          <iframe
            src={contentUrl}
            title={lesson.title}
            className="w-full h-[70vh] rounded-xl bg-white"
          />
        )}
      </div>
    </div>
  );
}
