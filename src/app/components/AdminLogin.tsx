import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield } from 'lucide-react';
import { useAuth } from '../AuthContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="min-h-full flex flex-col p-6">
        {/* Logo */}
        <div className="flex justify-center mt-8 mb-12">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-full p-4 shadow-lg">
            <Shield className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Admin Login</h1>
          <p className="text-gray-500 text-sm">Access the admin dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex-1">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter admin email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in…' : 'Login as Admin'}
          </button>
        </form>

        <div className="text-center mt-6 mb-4">
          <button onClick={() => navigate('/login')} className="text-gray-600 text-sm hover:text-purple-600">
            ← Back to Student Login
          </button>
        </div>
      </div>
    </div>
  );
}
