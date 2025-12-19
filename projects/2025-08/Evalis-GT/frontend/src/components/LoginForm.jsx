import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [userType, setUserType] = useState('student');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState({ loading: false, success: false, message: '' });
  
  const { studentLogin, teacherLogin, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (userType === 'student') {
        await studentLogin(id, password);
        navigate('/student');
      } else if (userType === 'teacher') {
        await teacherLogin(email, password);
        navigate('/teacher');
      } else {
        await adminLogin(username, password);
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    const resetEmail = email || (id && id.includes('@') ? id : '');
    
    if (!resetEmail) {
      setResetStatus({
        loading: false,
        success: false,
        message: 'Please enter a valid email address'
      });
      return;
    }
    
    setResetStatus({ loading: true, success: false, message: 'Password reset is disabled...' });
    
    try {
      // Firebase password reset is disabled - using Clerk only
      setResetStatus({
        loading: false,
        success: false,
        message: 'Password reset is currently disabled. Please contact an administrator.'
      });
    } catch (err) {
      console.error('Password reset error:', err);
      setResetStatus({
        loading: false,
        success: false,
        message: 'Password reset functionality is disabled'
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Evalis</h2>
      
      <div className="flex justify-center mb-6">
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          <button
            type="button"
            className={`px-4 py-2 ${userType === 'student' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setUserType('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${userType === 'teacher' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setUserType('teacher')}
          >
            Teacher
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${userType === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setUserType('admin')}
          >
            Admin
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {userType === 'admin' ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>
        ) : userType === 'teacher' ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teacherIdentifier">
              Email or ID
            </label>
            <input
              id="teacherIdentifier"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email or teacher ID"
            />
            <p className="mt-1 text-sm text-gray-500">
              You can use either your teacher ID (e.g., T0001) or your email address.
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id">
              ID
            </label>
            <input
              id="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter your ${userType} ID`}
            />
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      
      {/* Password Reset Section */}
      {(userType === 'student' || userType === 'teacher') && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetStatus.loading}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Forgot password? Reset it here
          </button>
          
          {resetStatus.message && (
            <div className={`mt-2 p-2 text-sm rounded ${resetStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {resetStatus.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}