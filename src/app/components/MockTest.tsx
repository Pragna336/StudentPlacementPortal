import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, FileText, CircleAlert as AlertCircle, ChevronRight } from 'lucide-react';
import { api, TestType } from '../api';

export function MockTest() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    api.tests.getAll()
      .then((res) => setTests(res.tests))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Aptitude', 'Coding', 'Technical', 'HR', 'Mock'];

  const filtered = selectedCategory
    ? tests.filter((t) => t.category === selectedCategory)
    : tests;

  const handleStartTest = (test: TestType) => {
    // Store selected test in sessionStorage for TestQuestion component
    sessionStorage.setItem('activeTest', JSON.stringify(test));
    navigate('/test-question');
  };

  const diffColor: Record<string, string> = {
    Easy:   'text-green-600 bg-green-100',
    Medium: 'text-orange-600 bg-orange-100',
    Hard:   'text-red-600 bg-red-100',
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2">Mock Tests</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Category Filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">How It Works</h2>
          <div className="space-y-3">
            {[
              { icon: FileText,      color: 'purple', text: 'Pick any test below and start' },
              { icon: Clock,         color: 'orange', text: 'Answer within the time limit' },
              { icon: AlertCircle,   color: 'green',  text: 'Get instant results & explanations' },
            ].map(({ icon: Icon, color, text }, i) => (
              <div key={i} className="flex items-center">
                <div className={`bg-${color}-100 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 text-${color}-600`} />
                </div>
                <p className="ml-3 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test Listing */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-300 border-t-purple-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No tests available.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((test) => (
              <button
                key={test._id}
                onClick={() => handleStartTest(test)}
                className="w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        {test.category}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColor[test.difficulty] ?? ''}`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mt-1">{test.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>⏱ {test.duration} min</span>
                      <span>📝 {test.questions?.length ?? 0} Qs</span>
                      <span>🎯 Pass: {test.passingScore}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
