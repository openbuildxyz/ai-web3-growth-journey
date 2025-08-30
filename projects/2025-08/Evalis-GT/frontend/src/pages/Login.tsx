import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GraduationCap, Shield, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const roles = [
    { id: 'student', label: 'Student', icon: User, color: 'blue' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'green' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'red' }
  ] as const;

  const bg = (c: string) =>
    c === 'red' ? 'bg-red-600 hover:bg-red-700' : c === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';
  const ring = (c: string) =>
    c === 'red' ? 'ring-red-200' : c === 'green' ? 'ring-green-200' : 'ring-blue-200';

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure by Clerk
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 tracking-tight">Welcome to Evalis</h1>
          <p className="mt-2 text-sm text-gray-600">Choose your portal to continue</p>
        </div>

        <div className="space-y-3">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className={`w-full flex items-center justify-between rounded-xl border border-gray-200 ${ring(r.color)} px-4 py-3 transition-shadow hover:shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white ${bg(r.color)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{r.label}</div>
                    <div className="text-xs text-gray-500">Sign in to {r.label} portal</div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(`/${r.id}/sign-in`)}
                  className={`${bg(r.color)} text-white`} 
                  size="sm"
                >
                  Continue
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">Each portal is separate. Signing in to one doesn’t sign you into others.</p>
      </div>
    </div>
  );
}
