import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-[360px] h-[800px] bg-white overflow-hidden shadow-2xl rounded-2xl">
          <RouterProvider router={router} />
        </div>
      </div>
    </AuthProvider>
  );
}