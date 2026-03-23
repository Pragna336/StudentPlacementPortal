import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, TestType, QuestionType, AnswerPayload } from '../api';

export function TestQuestion() {
  const navigate = useNavigate();
  const [test, setTest] = useState<TestType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  // Load test from sessionStorage (set by MockTest component)
  useEffect(() => {
    const raw = sessionStorage.getItem('activeTest');
    if (!raw) { navigate('/mock-test'); return; }
    const t: TestType = JSON.parse(raw);
    setTest(t);
    setTimeLeft(t.duration * 60);
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test]); // only start once test is loaded

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!test || submitting) return;
    setSubmitting(true);

    const payload: AnswerPayload[] = test.questions.map((q) => ({
      questionId:     q._id,
      selectedAnswer: answers[q._id] ?? '',
    }));

    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    try {
      const res = await api.tests.submit(test._id, payload, timeTaken);
      // Store result for ResultScreen
      sessionStorage.setItem('testResult', JSON.stringify(res.result));
      sessionStorage.removeItem('activeTest');
      navigate('/result');
    } catch {
      alert('Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  };

  if (!test) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-300 border-t-purple-600" />
      </div>
    );
  }

  const question: QuestionType = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Clock className={`w-5 h-5 mr-2 ${timeLeft < 60 ? 'text-red-500' : 'text-orange-600'}`} />
            <span className={`font-semibold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-800'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-purple-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Question Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {test.category}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {question.difficulty}
            </span>
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              {question.marks} mark{question.marks !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="text-base font-semibold text-gray-800 leading-relaxed">
            {question.questionText}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {question.options.map((option, i) => {
            const isSelected = answers[question._id] === option;
            return (
              <button
                key={i}
                onClick={() => handleSelectOption(question._id, option)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`ml-3 text-sm ${isSelected ? 'text-purple-700 font-medium' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Answered count */}
        <p className="text-center text-xs text-gray-400">
          {answeredCount} of {totalQuestions} answered
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white px-6 py-4 shadow-lg border-t border-gray-200">
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : `Submit Test (${answeredCount}/${totalQuestions})`}
        </button>
      </div>
    </div>
  );
}
