import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

export function InterviewPreparation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hr' | 'technical' | 'tips'>('hr');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const hrQuestions = [
    {
      question: 'Tell me about yourself',
      answer: 'Start with your educational background, highlight relevant skills and experiences, and express enthusiasm for the role.'
    },
    {
      question: 'What are your strengths and weaknesses?',
      answer: 'Focus on strengths relevant to the job. For weaknesses, mention areas you are actively working to improve.'
    },
    {
      question: 'Why should we hire you?',
      answer: 'Highlight your unique skills, experiences, and how they align with the company\'s needs and values.'
    }
  ];

  const technicalQuestions = [
    {
      question: 'Explain Object-Oriented Programming',
      answer: 'OOP is a programming paradigm based on objects containing data and methods. Key concepts include encapsulation, inheritance, polymorphism, and abstraction.'
    },
    {
      question: 'What is the difference between SQL and NoSQL?',
      answer: 'SQL databases are relational and use structured schemas. NoSQL databases are non-relational and offer flexible schemas for unstructured data.'
    },
    {
      question: 'Explain the concept of REST API',
      answer: 'REST is an architectural style for designing networked applications using HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations.'
    }
  ];

  const currentQuestions = activeTab === 'hr' ? hrQuestions : technicalQuestions;

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
            Interview Preparation
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 shadow-sm">
        <div className="flex space-x-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('hr')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'hr'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            HR Questions
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'technical'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Technical
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tips'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tips
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'tips' ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-5 border border-orange-200 shadow-sm">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-orange-400 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Interview Tips
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Research the company thoroughly before the interview</li>
                    <li>• Dress professionally and arrive 10-15 minutes early</li>
                    <li>• Maintain eye contact and show confidence</li>
                    <li>• Prepare questions to ask the interviewer</li>
                    <li>• Practice common interview questions</li>
                    <li>• Be honest and authentic in your responses</li>
                    <li>• Follow up with a thank-you email</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-3">
                Body Language Tips
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Sit up straight with good posture</li>
                <li>• Use hand gestures naturally when explaining</li>
                <li>• Smile genuinely and stay positive</li>
                <li>• Avoid fidgeting or playing with objects</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentQuestions.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 text-left text-sm">
                    {item.question}
                  </span>
                  {expandedQuestion === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </button>
                {expandedQuestion === index && (
                  <div className="px-5 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
