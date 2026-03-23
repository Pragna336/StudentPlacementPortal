import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Mail, Hash, Key, LogOut, Building, BookOpen, Briefcase, CircleCheck as CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api } from '../api';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout, updateLocalUser } = useAuth();
  const [stats, setStats] = useState({ testsAttempted: 0, avgScore: 0, streak: 0, badges: 0 });
  const [changePwMode, setChangePwMode] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api.progress.getSummary()
      .then((res) => {
        setStats({
          testsAttempted: res.summary.totalTestsAttempted,
          avgScore:        res.summary.averageScore,
          streak:          res.summary.currentStreak,
          badges:          res.summary.badges,
        });
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await api.user.changePassword(pwForm.current, pwForm.newPw);
      setPwSuccess('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setChangePwMode(false), 1500);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2">Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Avatar Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <User className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{user?.name ?? '—'}</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role ?? 'Student'}</p>
            {user?.isPlaced && (
              <div className="mt-2 flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Placed at {user.placedAt}
                {user.placedPackage ? ` · ${user.placedPackage} LPA` : ''}
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <InfoRow icon={<User className="w-5 h-5 text-purple-600" />} bg="bg-purple-100" label="Full Name" value={user?.name ?? '—'} />
            <InfoRow icon={<Mail className="w-5 h-5 text-pink-600" />}   bg="bg-pink-100"   label="Email"     value={user?.email ?? '—'} />
            {user?.rollNo && (
              <InfoRow icon={<Hash className="w-5 h-5 text-orange-600" />} bg="bg-orange-100" label="Roll Number" value={user.rollNo} />
            )}
            {user?.college && (
              <InfoRow icon={<Building className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-100" label="College" value={user.college} />
            )}
            {user?.branch && (
              <InfoRow icon={<BookOpen className="w-5 h-5 text-green-600" />} bg="bg-green-100" label="Branch" value={`${user.branch}${user.year ? ` · ${user.year} Year` : ''}`} />
            )}
            {user?.targetRole && (
              <InfoRow icon={<Briefcase className="w-5 h-5 text-blue-600" />} bg="bg-blue-100" label="Target Role" value={user.targetRole} />
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="space-y-3 mb-6">
          {!changePwMode ? (
            <button
              onClick={() => setChangePwMode(true)}
              className="w-full bg-white text-gray-700 py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-shadow font-medium flex items-center"
            >
              <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <span>Change Password</span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-3">Change Password</h3>
              {pwError   && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{pwError}</div>}
              {pwSuccess && <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs">{pwSuccess}</div>}
              <form onSubmit={handleChangePassword} className="space-y-3">
                {[
                  { label: 'Current Password', field: 'current' as const },
                  { label: 'New Password',     field: 'newPw'   as const },
                  { label: 'Confirm New',      field: 'confirm' as const },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-gray-700 text-xs font-medium mb-1">{label}</label>
                    <input
                      type="password"
                      value={pwForm[field]}
                      onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setChangePwMode(false); setPwError(''); }}
                    className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={pwLoading}
                    className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium disabled:opacity-60">
                    {pwLoading ? 'Saving…' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow font-medium flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4">Your Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat value={stats.testsAttempted} label="Tests Completed" color="text-purple-600" bg="bg-purple-50" />
            <Stat value={`${stats.avgScore}%`}   label="Avg Score"      color="text-orange-600" bg="bg-orange-50" />
            <Stat value={stats.streak}            label="Day Streak"     color="text-green-600"  bg="bg-green-50" />
            <Stat value={stats.badges}            label="Badges Earned"  color="text-pink-600"   bg="bg-pink-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, bg, label, value }: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start">
      <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div className="ml-3">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800 text-sm">{value}</p>
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
