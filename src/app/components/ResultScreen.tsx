import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Trophy, CircleCheck as CheckCircle, CircleX as XCircle, Target, RotateCcw, BarChart3, Star } from 'lucide-react';
import { TestResult, GradedAnswer } from '../api';

export function ResultScreen() {
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('testResult');
    if (raw) {
      setResult(JSON.parse(raw));
    }
  }, []);

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <p className="text-gray-500 mb-4">No result found.</p>
          <button onClick={() => navigate('/mock-test')} className="text-purple-600 font-medium">
            Go to Tests
          </button>
        </div>
      </div>
    );
  }

  const { score, totalMarks, percentage, passed, newBadges, gradedAnswers } = result;
  const correct = gradedAnswers.filter((a) => a.isCorrect).length;
  const wrong   = gradedAnswers.filter((a) => !a.isCorrect && a.selectedAnswer).length;
  const skipped = gradedAnswers.filter((a) => !a.selectedAnswer).length;
  const progressArc = 2 * Math.PI * 70 * (percentage / 100);

  return (
    <div className="h-full overflow-y-auto bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="min-h-full flex flex-col p-6">
        {/* Header */}
        <div className="text-center mt-6 mb-5">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg mb-3 ${
            passed ? 'bg-gradient-to-br from-orange-400 to-purple-600' : 'bg-gradient-to-br from-red-400 to-red-600'
          }`}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {passed ? '🎉 Well Done!' : 'Keep Trying!'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {passed ? 'You passed the test!' : `Need ${Math.max(0, Math.ceil(totalMarks * 0.4) - score)} more marks to pass`}
          </p>
        </div>

        {/* New Badges */}
        {newBadges && newBadges.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <h3 className="font-semibold text-gray-800 text-sm">New Badges Earned!</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {newBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm text-sm">
                  <span>{b.icon}</span>
                  <span className="font-medium text-gray-700">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Circle */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-5">
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="62" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                <circle
                  cx="72" cy="72" r="62"
                  stroke={passed ? 'url(#resultGrad)' : '#EF4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 62 * (percentage / 100)} ${2 * Math.PI * 62}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="resultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFB347" />
                    <stop offset="100%" stopColor="#9370DB" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{score}</div>
                  <div className="text-gray-400 text-sm">/{totalMarks}</div>
                  <div className="text-sm font-semibold text-gray-600">{percentage}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xl font-bold text-gray-800">{correct}</div>
              <div className="text-xs text-gray-500 mt-0.5">Correct</div>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-xl font-bold text-gray-800">{wrong}</div>
              <div className="text-xs text-gray-500 mt-0.5">Wrong</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-gray-800">{skipped}</div>
              <div className="text-xs text-gray-500 mt-0.5">Skipped</div>
            </div>
          </div>
        </div>

        {/* Answer Review Toggle */}
        <button
          onClick={() => setShowAnswers((v) => !v)}
          className="w-full bg-white border-2 border-purple-200 text-purple-600 py-3 rounded-xl font-medium mb-4 hover:bg-purple-50 transition-colors"
        >
          {showAnswers ? 'Hide Answers' : 'Review Answers & Explanations'}
        </button>

        {/* Answer Review */}
        {showAnswers && (
          <div className="space-y-3 mb-5">
            {gradedAnswers.map((a: GradedAnswer, i: number) => (
              <div key={i} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                a.isCorrect ? 'border-green-500' : 'border-red-400'
              }`}>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Q{i + 1}. {a.questionText}
                </p>
                {a.selectedAnswer && (
                  <p className={`text-xs mb-1 ${a.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    Your answer: {a.selectedAnswer} {a.isCorrect ? '✓' : '✗'}
                  </p>
                )}
                {!a.isCorrect && (
                  <p className="text-xs text-green-600 mb-1">Correct: {a.correctAnswer}</p>
                )}
                {a.explanation && (
                  <p className="text-xs text-gray-500 italic mt-1">💡 {a.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={() => navigate('/mock-test')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow font-medium flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" /> Try Another Test
          </button>
          <button
            onClick={() => navigate('/progress')}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow font-medium flex items-center justify-center"
          >
            <BarChart3 className="w-5 h-5 mr-2" /> View Progress
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
