import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

interface ClerkAuthProps {
  userType?: 'student' | 'teacher' | 'admin';
}

export default function ClerkAuth({ userType = 'student' }: ClerkAuthProps) {
  const getUserTypeConfig = () => {
    switch (userType) {
      case 'student':
        return {
          title: 'Student Sign In',
          color: '#007bff',
          description: 'Sign in to access your grades and assignments'
        };
      case 'teacher':
        return {
          title: 'Teacher Sign In',
          color: '#28a745',
          description: 'Sign in to manage classes and grade students'
        };
      case 'admin':
        return {
          title: 'Admin Sign In',
          color: '#6f42c1',
          description: 'Sign in to access system administration'
        };
      default:
        return {
          title: 'Sign In',
          color: '#007bff',
          description: 'Sign in to continue'
        };
    }
  };

  const config = getUserTypeConfig();

  return (
    <div className="clerk-auth-container" style={{ 
      padding: '20px', 
      border: '2px solid #e9ecef', 
      margin: '20px 0', 
      borderRadius: '12px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ color: config.color, marginBottom: '10px' }}>{config.title}</h3>
      <SignedOut>
        <div style={{ marginBottom: '15px' }}>
          <SignInButton mode="modal">
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: config.color, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              width: '100%'
            }}>
              Sign In as {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </button>
          </SignInButton>
        </div>
        <p style={{ 
          color: '#6c757d', 
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          {config.description}
        </p>
        <p style={{ 
          color: '#dc3545', 
          fontSize: '12px',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          No account? Contact your administrator to create an account.
        </p>
      </SignedOut>
      
      <SignedIn>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <span style={{ color: config.color, fontWeight: '500' }}>
            Welcome! You're signed in.
          </span>
          <UserButton afterSignOutUrl="/login" />
        </div>
      </SignedIn>
    </div>
  );
}
