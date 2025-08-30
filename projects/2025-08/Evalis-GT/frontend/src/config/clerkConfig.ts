// Clerk configuration for different user types
export const CLERK_CONFIGS = {
  admin: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY_ADMIN || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5vdWdoLW1hcnRlbi01MC5jbGVyay5hY2NvdW50cy5kZXYk',
    domain: import.meta.env.VITE_CLERK_DOMAIN_ADMIN,
    isSatellite: false,
    signInUrl: '/admin/sign-in',
    signUpUrl: '/admin/sign-up',
    afterSignInUrl: '/admin',
    afterSignUpUrl: '/admin',
  },
  teacher: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY_TEACHER || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5vdWdoLW1hcnRlbi01MC5jbGVyay5hY2NvdW50cy5kZXYk',
    domain: import.meta.env.VITE_CLERK_DOMAIN_TEACHER,
    isSatellite: false,
    signInUrl: '/teacher/sign-in',
    signUpUrl: '/teacher/sign-up',
    afterSignInUrl: '/teacher',
    afterSignUpUrl: '/teacher',
  },
  student: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY_STUDENT || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5vdWdoLW1hcnRlbi01MC5jbGVyay5hY2NvdW50cy5kZXYk',
    domain: import.meta.env.VITE_CLERK_DOMAIN_STUDENT,
    isSatellite: false,
    signInUrl: '/student/sign-in',
    signUpUrl: '/student/sign-up',
    afterSignInUrl: '/student',
    afterSignUpUrl: '/student',
  }
};

export type UserRole = 'admin' | 'teacher' | 'student';
