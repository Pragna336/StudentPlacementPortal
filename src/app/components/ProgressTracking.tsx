import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Code, MessageSquare, TrendingUp, Trophy } from 'lucide-react';
import { api, ProgressSummary, AttemptEntry } from '../api';

export function ProgressTracking() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [history, setHistory] = useState<AttemptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.progress.getSummary(),
      api.progress.getHistory(1),
    ])
      .then(([sumRes, histRes]) => {
        setSummary(sumRes.summary);
        setHistory(histRes.history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const catIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Aptitude:  BookOpen,
    Coding:    Code,
    Technical: MessageSquare,
    HR:        MessageSquare,
    Mock:      Trophy,
  };

  const catColors: Record<string, string> = {
    Aptitude:  'from-orange-400 to-orange-500',
    Coding:    'from-purple-500 to-purple-600',
    Technical: 'from-indigo-500 to-indigo-600',
    HR:        'from-pink-400 to-pink-500',
    Mock:      'from-green-500 to-green-600',
  };

  // Build weekly chart from recentAttempts or history
  const recentAttempts = summary?.recentAttempts ?? [];
  const chartData = recentAttempts.length > 0
    ? recentAttempts.slice(-7).map((a) => ({
        label: a.testTitle?.slice(0, 5) ?? '—',
        score: a.percentage,
      }))
    : [{ label: 'No data', score: 0 }];

  const maxScore = Math.max(...chartData.map((d) => d.score), 1);

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2">Your Progress</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-300 border-t-purple-600" />
          </div>
        ) : (
          <>
            {/* Weekly Performance Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Performance</h3>
              <div className="flex items-end justify-around h-36 mb-4">
                {chartData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-400 mb-1">{d.score}%</div>
                    <div
                      className="bg-gradient-to-t from-orange-400 to-purple-600 rounded-t-lg mx-auto transition-all"
                      style={{ height: `${(d.score / maxScore) * 100}px`, minHeight: '4px', maxWidth: '28px', width: '100%' }}
                    />
                    <span className="text-xs text-gray-500 mt-1 truncate w-8 text-center">{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">
                  Average Score: <span className="font-semibold text-gray-800">{summary?.averageScore ?? 0}%</span>
                </span>
              </div>
            </div>

            {/* Category Cards */}
            <div className="space-y-4 mb-6">
              {Object.entries(summary?.categoryStats ?? {}).map(([cat, data]) => {
                const Icon = catIcons[cat] ?? BookOpen;
                const color = catColors[cat] ?? 'from-gray-400 to-gray-500';
                return (
                  <div key={cat} className="bg-white rounded-2xl p-5 shadow-md">
                    <div className="flex items-center mb-4">
                      <div className={`bg-gradient-to-br ${color} w-12 h-12 rounded-xl flex items-center justify-center shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold text-gray-800">{cat}</h3>
                        <p className="text-xs text-gray-500">{data.attempted} attempts</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">{data.avgScore}%</div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${color} rounded-full`}
                        style={{ width: `${Math.min(data.avgScore, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Attempts</h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{a.testTitle ?? 'Test'}</p>
                        <p className="text-xs text-gray-500">{a.category} · {a.attemptedAt ? new Date(a.attemptedAt).toLocaleDateString() : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>{a.percentage}%</p>
                        <p className="text-xs text-gray-500">{a.score}/{a.totalMarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-4">Overall Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <Stat value={summary?.totalTestsAttempted ?? 0} label="Tests Taken"   color="text-purple-600" bg="bg-purple-50" />
                <Stat value={`${summary?.averageScore ?? 0}%`}   label="Avg Accuracy"  color="text-orange-600" bg="bg-orange-50" />
                <Stat value={`${summary?.totalTestsPassed ?? 0}`} label="Tests Passed" color="text-green-600"  bg="bg-green-50" />
                <Stat value={summary?.currentStreak ?? 0}         label="Day Streak"   color="text-pink-600"   bg="bg-pink-50" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, color, bg }: { value: number | string; label: string; color: string; bg: string }) {
  return (
    <div className={`text-center p-3 ${bg} rounded-xl`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
