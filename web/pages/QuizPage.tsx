import React, { useState, useEffect } from 'react';
import { Quiz, View } from '../types.ts';
import { api } from '../services/api.ts';
import { CheckCircleIcon, XCircleIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

interface QuizPageProps {
  quizId: string;
  courseId: string;
  lessonId: string;
  setView: (view: View) => void;
}

const QuizPage: React.FC<QuizPageProps> = ({ quizId, courseId, setView }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    api.getQuizById(quizId).then(setQuiz);
  }, [quizId]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz || !user) return;
    let newScore = 0;
    quiz.questions.forEach((q, index) => {
      if (q.correctAnswerIndex === selectedAnswers[index]) {
        newScore++;
      }
    });
    const finalScore = (newScore / quiz.questions.length) * 100;
    setScore(finalScore);
    setIsSubmitted(true);
    api.submitQuiz(user.id, quizId, finalScore, selectedAnswers);
  };

  if (!quiz) return <div className="text-center py-10">Loading quiz...</div>;
  
  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
        <p className="text-5xl font-bold mb-4 text-indigo-500">{score.toFixed(0)}%</p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">You answered {Math.round(score/100 * quiz.questions.length)} out of {quiz.questions.length} questions correctly.</p>
        <button 
          onClick={() => setView({ page: 'course', id: courseId })}
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
      
      <div className="mb-8">
        <p className="text-lg font-semibold">{currentQuestion.text}</p>
      </div>

      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === index;
          return (
            <button 
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' : 'bg-slate-50 dark:bg-slate-700 border-transparent hover:border-indigo-300'}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between items-center">
        {currentQuestionIndex > 0 && 
            <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">
                Previous
            </button>
        }
        <div className="flex-grow"></div>
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-slate-400" disabled={selectedAnswers[currentQuestionIndex] === undefined}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-slate-400" disabled={selectedAnswers[currentQuestionIndex] === undefined}>
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;