import { useNavigate } from 'react-router';
import { ArrowLeft, Calculator, Brain, BookText, ChevronRight } from 'lucide-react';

export function AptitudePractice() {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Quantitative Aptitude',
      icon: Calculator,
      color: 'from-orange-400 to-orange-500',
      questions: '50 Questions'
    },
    {
      title: 'Logical Reasoning',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      questions: '40 Questions'
    },
    {
      title: 'Verbal Ability',
      icon: BookText,
      color: 'from-pink-400 to-pink-500',
      questions: '45 Questions'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2">
            Aptitude Practice
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-gray-600 mb-6">
          Choose a category to start practicing
        </p>

        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className={`bg-gradient-to-br ${category.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-sm`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {category.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {category.questions}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/test-question')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
              >
                <span className="font-medium">Start Test</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ))}
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-5 shadow-md mt-6">
          <h3 className="font-semibold text-gray-800 mb-3">Your Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">24</div>
              <div className="text-xs text-gray-500 mt-1">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">18</div>
              <div className="text-xs text-gray-500 mt-1">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">76%</div>
              <div className="text-xs text-gray-500 mt-1">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
