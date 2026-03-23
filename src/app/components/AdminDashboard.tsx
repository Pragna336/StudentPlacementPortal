import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Users, BookOpen, Settings, LogOut, Search, Plus, 
  CircleCheck as CheckCircle, CircleX as XCircle, BarChart3,
  FileText, TrendingUp, RefreshCw
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api, AdminStats, UserType, TestType } from '../api';

type Tab = 'overview' | 'students' | 'tests' | 'coding' | 'studentDetail';
type ModalType = null | 'test' | 'problem';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [modal, setModal] = useState<ModalType>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<UserType[]>([]);
  const [tests, setTests] = useState<TestType[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.admin.getDashboard(),
      api.admin.getStudents(),
      api.admin.getAllTests(),
      api.admin.getAllCodingProblems(),
    ])
      .then(([dashRes, stuRes, testRes, probRes]) => {
        setStats(dashRes.stats);
        setStudents(stuRes.users);
        setTests(testRes.tests);
        setProblems(probRes.problems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const handleMarkPlaced = async (userId: string, company: string) => {
    try {
      await api.admin.updateStudent(userId, { isPlaced: true, placedAt: company });
      loadData();
    } catch { alert('Failed to update student.'); }
  };

  const handleDeleteTest = async (id: string) => {
     if (!confirm('Are you sure you want to delete this test?')) return;
     try {
       await api.admin.deleteTest?.(id);
       loadData();
     } catch { alert('Failed to delete test.'); }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    try {
      await api.admin.deleteCodingProblem?.(id);
      loadData();
    } catch { alert('Failed to delete problem.'); }
  };

  const handleQuickAddProblem = async () => {
    const title = prompt('Enter problem title:');
    if (!title) return;
    const description = prompt('Enter basic description:');
    try {
      await api.admin.createCodingProblem?.({
        title,
        description: description || 'No description provided.',
        slug: title.toLowerCase().replace(/ /g, '-'),
        difficulty: 'Easy',
        category: 'Arrays'
      });
      loadData();
    } catch { alert('Failed to add problem.'); }
  };

  const handleQuickAddStudent = async () => {
    const name = prompt('Enter student name:');
    if (!name) return;
    const email = prompt('Enter student email:');
    if (!email) return;
    const password = prompt('Enter temporary password:');
    if (!password) return;
    
    try {
      await api.admin.createStudent({
        name,
        email,
        password,
        college: prompt('Enter college (optional):') || '',
        branch: prompt('Enter branch (optional):') || '',
        year: prompt('Enter year (optional):') || ''
      });
      loadData();
    } catch (err: any) { alert(err.message || 'Failed to add student.'); }
  };

  const viewStudentDetail = async (studentId: string) => {
    setLoading(true);
    try {
      const res = await api.admin.getStudentProgress(studentId);
      setSelectedStudent(res.progress);
      setTab('studentDetail');
    } catch { alert('Failed to load student progress.'); }
    setLoading(false);
  };

  const filteredStudents = search
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          (s.college ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : students;

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your portal</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={handleLogout} className="p-2 bg-red-100 rounded-full hover:bg-red-200">
              <LogOut className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mt-3 bg-gray-100 rounded-xl p-1">
          {(['overview', 'students', 'tests', 'coding'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-300 border-t-purple-600" />
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ────────────────────────────── */}
            {tab === 'overview' && stats && (
              <div className="space-y-4">
                {/* Stat Cards */}
                {[
                  { label: 'Total Students',  value: stats.totalStudents,  icon: Users,      color: 'from-purple-500 to-purple-600' },
                  { label: 'Total Tests',      value: stats.totalTests,     icon: FileText,   color: 'from-orange-400 to-orange-500' },
                  { label: 'Total Attempts',   value: stats.totalAttempts,  icon: BarChart3,  color: 'from-indigo-500 to-indigo-600' },
                  { label: 'Avg Performance',  value: `${stats.averageScore}%`, icon: TrendingUp, color: 'from-green-500 to-green-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-md flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${s.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-sm`}>
                      <s.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                ))}

                {/* Placement Stats */}
                <div className="bg-white rounded-2xl p-5 shadow-md">
                  <h3 className="font-semibold text-gray-800 mb-3">Placement Overview</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Placed: {stats.placedStudents}</span>
                    <span className="text-sm font-bold text-green-600">{stats.placementRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      style={{ width: `${stats.placementRate}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STUDENTS TAB ─────────────────────────────── */}
            {tab === 'students' && (
              <div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, college…"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
                />
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-gray-400">{filteredStudents.length} students</p>
                  <button onClick={handleQuickAddStudent} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm">
                    + Add Student
                  </button>
                </div>
                <div className="space-y-3">
                  {filteredStudents.map((s) => (
                    <div key={s.id ?? s._id} className="bg-white rounded-2xl p-4 shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => viewStudentDetail(s.id ?? s._id ?? '')}>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                            {s.isPlaced && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" /> Placed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{s.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[s.college, s.branch, s.year ? `${s.year} Year` : ''].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!s.isPlaced && (
                            <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const company = prompt(`Mark ${s.name} as placed at:`);
                                 if (company) handleMarkPlaced(s.id ?? s._id ?? '', company);
                               }}
                               className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg font-medium"
                            >
                              + Placed
                            </button>
                          )}
                           <button
                             onClick={(e) => { e.stopPropagation(); viewStudentDetail(s.id ?? s._id ?? ''); }}
                             className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-lg font-medium"
                           >
                             Details
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STUDENT DETAIL TAB (Reviewer View) ────────── */}
            {tab === 'studentDetail' && selectedStudent && (
              <div className="space-y-4">
                <button onClick={() => setTab('students')} className="text-xs text-purple-600 flex items-center gap-1 font-medium mb-1">
                  ← Back to Student List
                </button>
                <div className="bg-white rounded-2xl p-5 shadow-md">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                         {selectedStudent.user.name.charAt(0)}
                      </div>
                      <div>
                         <h2 className="text-lg font-bold text-gray-800">{selectedStudent.user.name}</h2>
                         <p className="text-xs text-gray-500">{selectedStudent.user.email}</p>
                         <p className="text-[10px] text-gray-400 mt-1">{selectedStudent.user.college} · {selectedStudent.user.branch}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                         <p className="text-[10px] text-purple-500 uppercase tracking-wider font-bold">Avg Score</p>
                         <p className="text-xl font-bold text-purple-700">{selectedStudent.averageScore}%</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                         <p className="text-[10px] text-orange-500 uppercase tracking-wider font-bold">Attempts</p>
                         <p className="text-xl font-bold text-orange-700">{selectedStudent.totalTestsAttempted}</p>
                      </div>
                   </div>
                   <h3 className="font-bold text-gray-800 text-sm mb-3">Attempt History</h3>
                   <div className="space-y-2">
                      {selectedStudent.testAttempts.map((att: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                           <div>
                              <p className="text-xs font-semibold text-gray-700">{att.testTitle}</p>
                              <p className="text-[10px] text-gray-400 capitalize">{att.category} · {new Date(att.attemptedAt).toLocaleDateString()}</p>
                           </div>
                           <div className={`text-sm font-bold ${att.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {att.percentage}%
                           </div>
                        </div>
                      ))}
                      {selectedStudent.testAttempts.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No tests attempted yet.</p>}
                   </div>
                </div>
              </div>
            )}

            {/* ── TESTS TAB ────────────────────────────────── */}
            {tab === 'tests' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                   <p className="text-xs text-gray-400">{tests.length} mock tests</p>
                   <button onClick={() => setModal('test')} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm active:scale-95 transition-transform">
                      + New Test
                   </button>
                </div>
                <div className="space-y-3">
                  {tests.map((t) => (
                    <div key={t._id} className={`bg-white rounded-2xl p-4 shadow-md border-l-4 ${
                      t.isActive !== false ? 'border-green-500' : 'border-gray-300 opacity-60'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">{t.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">{t.category}</span>
                            <span className="text-xs text-gray-500">{t.difficulty}</span>
                            <span className="text-xs text-gray-400">{t.questions?.length ?? 0} Qs · {t.duration} min</span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div className="font-medium text-gray-700">{t.attemptCount ?? 0} attempts</div>
                          <div className={t.isActive !== false ? 'text-green-600' : 'text-gray-400'}>
                            {t.isActive !== false ? '● Active' : '○ Inactive'}
                          </div>
                          <button onClick={() => handleDeleteTest(t._id)} className="text-red-500 mt-2 hover:underline">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CODING TAB ────────────────────────────────── */}
            {tab === 'coding' && (
              <div>
                 <div className="flex justify-between items-center mb-4">
                   <p className="text-xs text-gray-400">{problems.length} coding challenges</p>
                   <button onClick={() => setModal('problem')} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm active:scale-95 transition-transform">
                      + New Problem
                   </button>
                </div>
                <div className="space-y-3">
                   {problems.map((p: any) => (
                     <div key={p._id} className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-indigo-400">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="font-semibold text-gray-800 text-sm">{p.title}</h3>
                              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                              <div className="flex gap-2 mt-2">
                                 <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                                 <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    p.difficulty === 'Easy' ? 'bg-green-50 text-green-600' : 
                                    p.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                 }`}>{p.difficulty}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-[10px] text-gray-400 font-medium">{p.solvedBy || 0} Solved</div>
                              <button onClick={() => handleDeleteProblem(p._id)} className="text-[10px] text-red-500 mt-2 hover:underline">Delete</button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setTab('overview')}
        className="fixed bottom-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-xl transition-shadow flex items-center justify-center active:scale-90"
        style={{ right: 'calc(50% - 180px + 24px)' }}
        title="Go to Overview"
      >
        <Plus className="w-6 h-6 rotate-45" />
      </button>

      {/* ── MODALS ─────────────────────────────────────── */}
      {modal === 'test' && <AddTestModal onClose={() => { setModal(null); loadData(); }} />}
      {modal === 'problem' && <AddProblemModal onClose={() => { setModal(null); loadData(); }} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD TEST MODAL
// ─────────────────────────────────────────────────────────────
function AddTestModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<any[]>([{ questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
  
  const updateQuestion = (idx: number, field: string, value: any) => {
    const qList = [...questions];
    qList[idx][field] = value;
    setQuestions(qList);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const qList = [...questions];
    qList[qIdx].options[oIdx] = value;
    setQuestions(qList);
  };

  const handleSave = async () => {
    if (!title) return alert('Title is required');
    setSaving(true);
    try {
      await api.admin.createTest({ title, category, difficulty, duration, questions });
      onClose();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Create New Test</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><XCircle className="w-6 h-6 text-gray-400" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Test Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="e.g. DBMS Fundamentals" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-purple-500 capitalize">
                {['Aptitude', 'Coding', 'Technical', 'HR', 'Mock'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Duration (min)</label>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Questions ({questions.length})</h3>
              <button onClick={addQuestion} className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">+ Add Question</button>
            </div>
            
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 relative">
                <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="absolute top-2 right-2 text-red-300 hover:text-red-500 transition-colors"><XCircle className="w-4 h-4" /></button>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Question {qIdx + 1}</label>
                  <textarea value={q.questionText} onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 min-h-[80px]" placeholder="Enter question text..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt: string, oIdx: number) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswer === opt && opt !== ''} onChange={() => updateQuestion(qIdx, 'correctAnswer', opt)} className="text-purple-600 focus:ring-purple-500" />
                      <input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm" placeholder={`Option ${oIdx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-2xl transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg relative overflow-hidden group">
            {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mx-auto" /> : 'Save and Publish'}
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD PROBLEM MODAL
// ─────────────────────────────────────────────────────────────
function AddProblemModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Arrays');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !description) return alert('Title and description are required');
    setSaving(true);
    try {
      await api.admin.createCodingProblem?.({
        title,
        description,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        difficulty,
        category,
        starterCode: { python: "def solve():\n    # Write your code here\n    pass\n\nsolve()" }
      });
      onClose();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-50/50">
          <h2 className="text-xl font-bold text-indigo-900">Add Coding Challenge</h2>
          <button onClick={onClose} className="p-2 hover:bg-indigo-100 rounded-full transition-colors"><XCircle className="w-6 h-6 text-indigo-300" /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block ml-1">Problem Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none" placeholder="e.g. Reverse Linked List" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block ml-1">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none">
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block ml-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none">
                {['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Math'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block ml-1">Detailed Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none min-h-[120px]" placeholder="Explain the problem constraints and examples..." />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-indigo-400 font-bold hover:bg-indigo-50 rounded-2xl transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 active:scale-95 transition-all">
            {saving ? "Publishing..." : "Create Problem"}
          </button>
        </div>
      </div>
    </div>
  );
}
