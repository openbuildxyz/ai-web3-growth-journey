import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import config from '../config/environment';

interface ResetPasswordPageProps {
  role: 'admin' | 'teacher' | 'student';
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ role }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No reset token provided');
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`${config.API_BASE_URL}/auth/validate-reset-token/${token}`);
        const data = await response.json();

        if (data.success) {
          setTokenValid(true);
        } else {
          setError(data.message || 'Invalid or expired reset token');
        }
      } catch (err) {
        setError('Failed to validate reset token');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password reset successfully! Redirecting to sign in...');
        setTimeout(() => {
          navigate(`/${role}/sign-in`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600 text-red-600 border-red-600';
      case 'teacher': return 'bg-green-600 text-green-600 border-green-600';
      case 'student': return 'bg-blue-600 text-blue-600 border-blue-600';
      default: return 'bg-gray-600 text-gray-600 border-gray-600';
    }
  };

  const getButtonColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600 hover:bg-red-700';
      case 'teacher': return 'bg-green-600 hover:bg-green-700';
      case 'student': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Invalid Reset Link</h2>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => navigate(`/${role}/sign-in`)}
              className={`mt-4 px-4 py-2 ${getButtonColor(role)} text-white rounded-md hover:opacity-90 transition-opacity`}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Set Your Password</h2>
          <div className={`inline-block px-3 py-1 mt-2 text-white text-sm rounded-full ${getRoleColor(role).split(' ')[0]}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Please create a secure password for your account
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                value={formData.newPassword}
                onChange={handleInputChange}
                minLength={6}
                placeholder="Enter your new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                minLength={6}
                placeholder="Confirm your new password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${getButtonColor(role)} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting Password...
                  </div>
                ) : (
                  'Set Password'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate(`/${role}/sign-in`)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
