// Central API client for the Placement Portal backend
// Uses relative path so Vite dev server proxy forwards to backend on port 5000

const BASE_URL = '/api';

// ── Token helpers ─────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem('pp_token');
export const setToken = (token: string) => localStorage.setItem('pp_token', token);
export const removeToken = () => localStorage.removeItem('pp_token');

export const getUser = () => {
  const u = localStorage.getItem('pp_user');
  return u ? JSON.parse(u) : null;
};
export const setUser = (user: object) =>
  localStorage.setItem('pp_user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('pp_user');

// ── Core fetch wrapper ────────────────────────────────────────
async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: UserType }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (data: RegisterData) =>
      request<{ token: string; user: UserType }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    adminLogin: (email: string, password: string) =>
      request<{ token: string; user: UserType }>('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<{ user: UserType }>('/auth/me'),

    logout: () =>
      request('/auth/logout', { method: 'POST' }),
  },

  // ─────────────────────────────────────────────────────────
  // USER
  // ─────────────────────────────────────────────────────────
  user: {
    getProfile: () => request<{ user: UserType }>('/user/profile'),

    updateProfile: (data: Partial<UserType>) =>
      request<{ user: UserType }>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    changePassword: (currentPassword: string, newPassword: string) =>
      request('/user/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),

    getLeaderboard: () =>
      request<{ leaderboard: LeaderboardEntry[] }>('/user/leaderboard'),
  },

  // ─────────────────────────────────────────────────────────
  // TESTS
  // ─────────────────────────────────────────────────────────
  tests: {
    getAll: (params?: TestFilters) => {
      const query = params
        ? '?' + new URLSearchParams(params as Record<string, string>).toString()
        : '';
      return request<{ tests: TestType[]; count: number }>(`/tests${query}`);
    },

    getOne: (id: string) => request<{ test: TestType }>(`/tests/${id}`),

    submit: (testId: string, answers: AnswerPayload[], timeTaken: number) =>
      request<{ result: TestResult }>(`/tests/${testId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, timeTaken }),
      }),
  },

  // ─────────────────────────────────────────────────────────
  // PROGRESS
  // ─────────────────────────────────────────────────────────
  progress: {
    getSummary: () => request<{ summary: ProgressSummary }>('/progress/summary'),

    getHistory: (page = 1, category?: string) => {
      const q = new URLSearchParams({ page: String(page) });
      if (category) q.set('category', category);
      return request<{ history: AttemptEntry[]; total: number }>(`/progress/history?${q}`);
    },

    getBadges: () => request<{ badges: Badge[] }>('/progress/badges'),

    getFull: () => request<{ progress: ProgressFull }>('/progress'),
  },

  // ─────────────────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────────────────
  admin: {
    getDashboard: () => request<{ stats: AdminStats }>('/admin/dashboard'),

    getStudents: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ users: UserType[]; total: number }>(`/admin/students${q}`);
    },

    createStudent: (data: RegisterData) =>
      request<{ student: UserType }>('/admin/students', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStudent: (id: string, data: object) =>
      request<{ user: UserType }>(`/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getAllTests: () => request<{ tests: TestType[] }>('/admin/tests'),

    createTest: (data: Partial<TestType>) =>
      request<{ test: TestType }>('/admin/tests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateTest: (id: string, data: Partial<TestType>) =>
      request<{ test: TestType }>(`/admin/tests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getAllCodingProblems: () => request<{ problems: any[] }>('/admin/coding-problems'),

    createCodingProblem: (data: any) =>
      request<{ problem: any }>('/admin/coding-problems', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    deleteCodingProblem: (id: string) =>
      request('/admin/coding-problems/' + id, { method: 'DELETE' }),

    getStudentProgress: (studentId: string) =>
      request<{ progress: ProgressFull }>(`/admin/students/${studentId}/progress`),

    deleteTest: (id: string) =>
      request('/admin/tests/' + id, { method: 'DELETE' }),
  },
};

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────
export interface UserType {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  college?: string;
  branch?: string;
  year?: string;
  cgpa?: number;
  rollNo?: string;
  bio?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  skills?: string[];
  targetCompanies?: string[];
  targetRole?: string;
  avatar?: string;
  resumeUrl?: string;
  isPlaced?: boolean;
  placedAt?: string;
  placedPackage?: number;
  lastLogin?: string;
  createdAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  college?: string;
  branch?: string;
  year?: string;
  rollNo?: string;
}

export interface TestType {
  _id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  duration: number;
  passingScore: number;
  totalMarks: number;
  questions: QuestionType[];
  tags?: string[];
  company?: string;
  attemptCount?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface QuestionType {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
  difficulty: string;
  marks: number;
}

export interface AnswerPayload {
  questionId: string;
  selectedAnswer: string;
}

export interface GradedAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
  marks: number;
}

export interface TestResult {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  newBadges: Badge[];
  gradedAnswers: GradedAnswer[];
}

export interface TestFilters {
  category?: string;
  difficulty?: string;
  search?: string;
  company?: string;
}

export interface ProgressSummary {
  totalTestsAttempted: number;
  totalTestsPassed: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  badges: number;
  categoryStats: Record<string, { attempted: number; avgScore: number }>;
  recentAttempts: AttemptEntry[];
}

export interface ProgressFull {
  totalTestsAttempted: number;
  totalTestsPassed: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  categoryStats: Record<string, { attempted: number; avgScore: number }>;
  testAttempts: AttemptEntry[];
  badges: Badge[];
}

export interface AttemptEntry {
  test?: string;
  testTitle?: string;
  category?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTaken?: number;
  attemptedAt?: string;
}

export interface Badge {
  name: string;
  icon: string;
  awardedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  college?: string;
  branch?: string;
  averageScore: number;
  testsAttempted: number;
  badges: number;
}

export interface AdminStats {
  totalStudents: number;
  placedStudents: number;
  placementRate: number;
  totalTests: number;
  totalAttempts: number;
  averageScore: number;
}
