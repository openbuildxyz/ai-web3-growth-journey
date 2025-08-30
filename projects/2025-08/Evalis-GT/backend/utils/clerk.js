const { clerkClient } = require('@clerk/express');
const { verifyToken } = require('@clerk/backend');

// Initialize clerk client with secret key from environment
if (!process.env.CLERK_SECRET_KEY) {
  console.warn('CLERK_SECRET_KEY not found in environment. Clerk authentication will not work.');
}

/**
 * Verify a Clerk session token from Authorization bearer header.
 * Returns the Clerk user object on success, null otherwise.
 */
async function verifyClerkToken(token) {
  if (!token || !process.env.CLERK_SECRET_KEY) return null;
  
  try {
    // Remove potential 'Bearer ' prefix if passed by mistake
    const raw = token.replace(/^Bearer\s+/i, '');
    
    // Verify Clerk JWT using backend SDK (RS256)
    const payload = await verifyToken(raw, {
      secretKey: process.env.CLERK_SECRET_KEY
    });
    
    if (!payload || !payload.sub) return null;
    
    // Get the full user object
    const user = await clerkClient.users.getUser(payload.sub);
    return user || null;
  } catch (err) {
    console.log('Clerk token verification failed:', err.message);
    return null;
  }
}

/**
 * Map a Clerk user to local DB record by email and infer role.
 * Priority: Admin -> Teacher -> Student.
 */
async function mapClerkUserToLocal(user, models, options = {}) {
  const { Student, Teacher, Admin } = models;
  const desiredRole = (options.desiredRole || '').toLowerCase();
  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;
  const clerkId = user?.id;

  // Prefer explicit linkage via clerkId when available
  const findBy = async (Model, where) => Model.findOne({ where, attributes: { exclude: ['password'] } }).catch(() => null);

  const roleQueries = {
    admin: async () => (await findBy(Admin, { clerkId })) || (primaryEmail ? await findBy(Admin, { email: primaryEmail }) : null),
    teacher: async () => (await findBy(Teacher, { clerkId })) || (primaryEmail ? await findBy(Teacher, { email: primaryEmail }) : null),
    student: async () => (await findBy(Student, { clerkId })) || (primaryEmail ? await findBy(Student, { email: primaryEmail }) : null),
  };

  // Enforce role-specific portals when a desired role was provided
  if (desiredRole === 'admin' || desiredRole === 'teacher' || desiredRole === 'student') {
    const match = await roleQueries[desiredRole]();
    if (match) return { user: match, role: desiredRole };
    return null;
  }

  // Fallback: priority Admin -> Teacher -> Student
  const adminUser = await roleQueries.admin();
  if (adminUser) return { user: adminUser, role: 'admin' };
  const teacherUser = await roleQueries.teacher();
  if (teacherUser) return { user: teacherUser, role: 'teacher' };
  const studentUser = await roleQueries.student();
  if (studentUser) return { user: studentUser, role: 'student' };

  return null;
}

module.exports = { verifyClerkToken, mapClerkUserToLocal };
