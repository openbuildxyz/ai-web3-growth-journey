import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import config from '../../config/environment';

interface EmailPasswordAuthProps {
  role: 'teacher' | 'student' | 'admin';
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
}

const EmailPasswordAuth: React.FC<EmailPasswordAuthProps> = ({ role, mode, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }

      if (mode === 'signup') {
        if (!formData.name) {
          setError('Please enter your name');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
      }

      const endpoint = mode === 'signin' ? '/auth/signin' : '/auth/signup';
      const payload = mode === 'signin' 
        ? { email: formData.email, password: formData.password, role }
        : { 
            email: formData.email, 
            password: formData.password, 
            name: formData.name, 
            role 
          };

      const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`);
      }

      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, data.token);
      }

      // Success
      if (mode === 'signup') {
        setError('Account created successfully! Please check your email for verification.');
      } else {
        window.location.href = `/${role}`;
      }
      
      onSuccess?.();

    } catch (err: any) {
      setError(err.message || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin': return 'bg-red-600 hover:bg-red-700';
      case 'teacher': return 'bg-green-600 hover:bg-green-700';
      case 'student': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {mode === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter your password"
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      {mode === 'signup' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            required
            disabled={loading}
            minLength={6}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className={`w-full text-white ${getRoleColor()}`}
      >
        {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
      </Button>

      {mode === 'signin' && (
        <div className="text-center">
          <a 
            href={`/reset-password?role=${role}`}
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
      )}
    </form>
  );
};

export default EmailPasswordAuth;
