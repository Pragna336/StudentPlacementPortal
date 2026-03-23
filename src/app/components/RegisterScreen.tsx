import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../AuthContext';

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    branch: '',
    year: '',
    rollNo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
        college:  formData.college,
        branch:   formData.branch,
        year:     formData.year,
        rollNo:   formData.rollNo,
      });
      navigate('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';

  return (
    <div className="h-full overflow-y-auto bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="min-h-full flex flex-col p-6">
        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">Start your placement preparation journey</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex-1">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              required className={inputClass} placeholder="Enter your full name" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              required className={inputClass} placeholder="Enter your email" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Roll Number</label>
            <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange}
              className={inputClass} placeholder="Enter your roll number" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">College</label>
            <input type="text" name="college" value={formData.college} onChange={handleChange}
              className={inputClass} placeholder="Enter your college name" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Branch</label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange}
                className={inputClass} placeholder="e.g. CSE" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Year</label>
              <select name="year" value={formData.year} onChange={handleChange} className={inputClass}>
                <option value="">Select</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              required className={inputClass} placeholder="Min 6 characters" />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password *</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              required className={inputClass} placeholder="Re-enter your password" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account…' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-6 mb-4">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-orange-500 font-medium hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
