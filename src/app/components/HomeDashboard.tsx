import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, BookOpen, Code, MessageSquare, FileText, Home, BarChart3, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api, ProgressSummary } from '../api';

export function HomeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    api.progress.getSummary()
      .then((res) => setSummary(res.summary))
      .catch(() => {}); // Silently fail — show static fallback
  }, []);

  const overallScore = summary?.averageScore ?? 0;
  const progressArc = 2 * Math.PI * 56 * (overallScore / 100);

  const features = [
    { title: 'Aptitude Practice',    icon: BookOpen,      color: 'from-orange-400 to-orange-500', path: '/aptitude'  },
    { title: 'Coding Practice',      icon: Code,          color: 'from-purple-500 to-purple-600', path: '/coding'    },
    { title: 'Interview Preparation',icon: MessageSquare, color: 'from-pink-400 to-pink-500',     path: '/interview' },
    { title: 'Mock Test',            icon: FileText,      color: 'from-indigo-500 to-indigo-600', path: '/mock-test' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Top Bar */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Hello, {user?.name?.split(' ')[0] ?? 'Student'} 👋
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Welcome back to learning</p>
          </div>
          <button className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Quick Stats Strip */}
        {summary && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="text-lg font-bold text-purple-600">{summary.totalTestsAttempted}</div>
              <div className="text-xs text-gray-500 mt-0.5">Tests Done</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="text-lg font-bold text-orange-500">{summary.currentStreak} 🔥</div>
              <div className="text-xs text-gray-500 mt-0.5">Day Streak</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="text-lg font-bold text-green-600">{summary.badges} 🏅</div>
              <div className="text-xs text-gray-500 mt-0.5">Badges</div>
            </div>
          </div>
        )}

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => navigate(feature.path)}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`bg-gradient-to-br ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-800 text-left">{feature.title}</h3>
            </button>
          ))}
        </div>

        {/* Progress Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Summary</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="url(#homeGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${progressArc} ${2 * Math.PI * 56}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFB347" />
                    <stop offset="100%" stopColor="#9370DB" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{overallScore}%</div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">Overall Performance</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg" style={{ maxWidth: '360px', margin: '0 auto' }}>
        <div className="grid grid-cols-4 h-16">
          <button onClick={() => navigate('/home')} className="flex flex-col items-center justify-center text-purple-600">
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button onClick={() => navigate('/aptitude')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs mt-1">Practice</span>
          </button>
          <button onClick={() => navigate('/progress')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">Progress</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600">
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
