import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Code, Play, CircleCheck as CheckCircle, CircleX as XCircle, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';

const LANGUAGE_TEMPLATES: Record<string, string> = {
  python: "import sys\n\n# Read all input from stdin\n# input_data = sys.stdin.read().split()\n\ndef solve():\n    # Example: line = sys.stdin.readline()\n    print('True')\n\nsolve()",
  javascript: "const fs = require('fs');\n\n// Read from /dev/stdin for local node execution\n// const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n\nfunction solve() {\n    console.log('True');\n}\n\nsolve();",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Example: while(sc.hasNext()) { ... }\n        \n        System.out.println(\"True\");\n    }\n}",
  cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Example: int n; while(cin >> n) { ... }\n    \n    cout << \"True\" << endl;\n    return 0;\n}",
  c: "#include <stdio.h>\n\nint main() {\n    // Example: int n; while(scanf(\"%d\", &n) != EOF) { ... }\n    \n    printf(\"True\\n\");\n    return 0;\n}\n"
};


const LANGUAGE_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
  c: "C"
};

export function CodingPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [problems, setProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGE_TEMPLATES["python"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    // Fetch problems from PG database
    fetch('/api/coding-problems')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProblems(data.problems);
      })
      .catch(console.error);

    // Fetch user submissions
    // Note: If user isn't fully using the new Postgres DB, user?.id might not map perfectly. 
    // We'll pass user._id or default to 1 for demonstration.
    const studentId = user?.id || user?._id?.slice(0,5) || '1'; 
    fetch(`/api/submissions?student_id=${studentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubmissions(data.submissions);
      })
      .catch(console.error);
  }, [user]);

  const handleSolve = (problem: any) => {
    setSelectedProblem(problem);
    setResult(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const studentId = user?.id || user?._id?.slice(0,5) || '1'; 
      const response = await fetch('/api/submit-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          problem_id: selectedProblem.id,
          code: code,
          language: language
        })
      });
      const data = await response.json();
      setResult(data);
      
      // Update local submissions list
      if (data.submission) {
        setSubmissions(prev => [data.submission, ...prev]);
      }
    } catch (err) {
      setResult({ result: 'Network Error', output: 'Could not connect to compiler' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => selectedProblem ? setSelectedProblem(null) : navigate('/home')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2">
            {selectedProblem ? 'Solve Problem' : 'Coding Practice'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: '2rem' }}>
        
        {!selectedProblem ? (
          <>
            <p className="text-sm text-gray-600 mb-6">
              Solve coding problems to improve your skills (Multi-language Compiler)
            </p>

            {problems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">Loading problems or none available...</p>
            ) : (
              <div className="space-y-4 mb-8">
                {problems.map((problem) => {
                  const hasAttempted = submissions.find(s => s.problem_id === problem.id);
                  const isAccepted = submissions.find(s => s.problem_id === problem.id && s.result === 'Accepted');
                  return (
                    <div
                      key={problem.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-white ${isAccepted ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
                            {isAccepted ? <CheckCircle className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="font-semibold text-gray-800 text-[15px]">
                              {problem.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">
                              {problem.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleSolve(problem)}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors ${
                          isAccepted 
                          ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        {isAccepted ? 'Solve Again' : hasAttempted ? 'Retry' : 'Solve'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {submissions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Recent Submissions</h3>
                <div className="space-y-2">
                  {submissions.slice(0, 5).map((sub, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Problem ID: {sub.problem_id}</span>
                      <span className={`font-semibold ${
                        sub.result === 'Accepted' ? 'text-green-600' : 
                        sub.result === 'Wrong Answer' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {sub.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col">
            <div className="bg-white rounded-2xl border border-gray-200 mb-6 shadow-sm">
              <div className="p-6">

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    selectedProblem.difficulty === 'Hard' ? 'bg-red-100 text-red-600' :
                    selectedProblem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {selectedProblem.difficulty || 'Easy'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {selectedProblem.category || 'Logic'}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-3">{selectedProblem.title}</h2>
                <div className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-wrap">{selectedProblem.description}</div>
                
                {selectedProblem.constraints && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Constraints</h4>
                    <div className="text-xs font-mono text-gray-500 bg-gray-50 p-2 rounded">
                      {selectedProblem.constraints}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {(selectedProblem.examples && selectedProblem.examples.length > 0 ? selectedProblem.examples : [
                    { input: selectedProblem.sample_input, output: selectedProblem.sample_output }
                  ]).map((ex: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                      <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Example {idx + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <strong className="text-gray-400 text-[10px]">Input:</strong>
                          <div className="bg-white bg-opacity-60 p-2 rounded mt-1 border border-indigo-50/50">{ex.input || 'None'}</div>
                        </div>
                        <div>
                          <strong className="text-gray-400 text-[10px]">Output:</strong>
                          <div className="bg-white bg-opacity-60 p-2 rounded mt-1 border border-indigo-50/50">{ex.output || 'None'}</div>
                        </div>
                      </div>
                      {ex.explanation && (
                        <div className="mt-2 text-[11px] text-gray-500 italic">
                          <strong>Note:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-12">
              <div className="flex flex-col bg-gray-900 font-mono">
                <div className="bg-gray-800 px-4 py-2.5 flex justify-between items-center text-xs text-gray-400 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <select 
                      value={language}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setLanguage(newLang);
                        const templateCode = selectedProblem.starterCode?.[newLang] || LANGUAGE_TEMPLATES[newLang];
                        setCode(templateCode);
                      }}
                      className="bg-gray-700 text-white rounded-md px-2 py-1 outline-none hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      {Object.entries(LANGUAGE_NAMES).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-700 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Editor Mode</span>
                    <span className="text-[10px] text-gray-500">UTF-8</span>
                  </div>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    const { selectionStart, selectionEnd, value } = target;

                    // 1. Handle Tab key (Indentation)
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const tabStr = "    ";
                      const before = value.substring(0, selectionStart);
                      const after = value.substring(selectionEnd);
                      setCode(before + tabStr + after);
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = selectionStart + tabStr.length;
                      }, 0);
                    }

                    // 2. Handle Auto-closing Brackets/Quotes
                    const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
                    if (pairs[e.key]) {
                      e.preventDefault();
                      const pair = pairs[e.key];
                      const before = value.substring(0, selectionStart);
                      const after = value.substring(selectionEnd);
                      setCode(before + e.key + pair + after);
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = selectionStart + 1;
                      }, 0);
                    }

                    // 3. Handle Auto-indentation on Enter
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const before = value.substring(0, selectionStart);
                      const after = value.substring(selectionEnd);
                      const lines = before.split('\n');
                      const currentLine = lines[lines.length - 1];
                      const indentMatch = currentLine.match(/^\s*/);
                      const indentation = indentMatch ? indentMatch[0] : "";
                      
                      const isOpeningBlock = currentLine.trim().endsWith('{') || currentLine.trim().endsWith(':') || currentLine.trim().endsWith('(');
                      
                      if (isOpeningBlock && after.trim().startsWith('}') || after.trim().startsWith(')') || after.trim().startsWith(']')) {
                        // Double indent + new line for closing bracket
                        const newText = "\n" + indentation + "    " + "\n" + indentation;
                        setCode(before + newText + after);
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd = selectionStart + indentation.length + 5; // Mid point
                        }, 0);
                      } else {
                        const extraIndent = isOpeningBlock ? "    " : "";
                        const newText = "\n" + indentation + extraIndent;
                        setCode(before + newText + after);
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd = selectionStart + newText.length;
                        }, 0);
                      }
                    }

                    // 4. Handle Backspace for deletion of pairs
                    if (e.key === 'Backspace' && selectionStart === selectionEnd) {
                      const charBefore = value[selectionStart - 1];
                      const charAfter = value[selectionStart];
                      const pairings = ["()", "{}", "[]", "''", '""'];
                      if (pairings.includes(charBefore + charAfter)) {
                        e.preventDefault();
                        setCode(value.substring(0, selectionStart - 1) + value.substring(selectionStart + 1));
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd = selectionStart - 1;
                        }, 0);
                      }
                    }
                  }}
                  className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-6 focus:outline-none resize-none min-h-[400px] leading-relaxed selection:bg-purple-500/30"
                  spellCheck={false}
                  placeholder="/* Write your code here... */"
                />
              </div>

              <div className="p-5 bg-white border-t border-gray-200">
                {result && (
                  <div className={`mb-4 p-4 rounded-xl shadow-sm ${
                    result.result === 'Accepted' ? 'bg-green-50 border border-green-200' :
                    result.result === 'Wrong Answer' ? 'bg-orange-50 border border-orange-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {result.result === 'Accepted' ? <CheckCircle className="w-5 h-5 text-green-600 mr-2" /> :
                       result.result === 'Wrong Answer' ? <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" /> :
                       <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                      <h4 className={`font-bold ${
                        result.result === 'Accepted' ? 'text-green-700' :
                        result.result === 'Wrong Answer' ? 'text-orange-700' : 'text-red-700'
                      }`}>{result.result}</h4>
                    </div>
                    <div className="text-xs font-mono bg-white bg-opacity-50 p-2 rounded max-h-24 overflow-y-auto">
                      {result.output || 'No output details'}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3.5 rounded-xl font-medium shadow-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" fill="currentColor" /> Run Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}
