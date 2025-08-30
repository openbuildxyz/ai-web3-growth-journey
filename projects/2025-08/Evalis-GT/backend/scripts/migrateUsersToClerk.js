/**
 * Migrate existing DB users (Admin/Teacher/Student) into Clerk by email.
 * Creates users in Clerk if they don't exist; does not set passwords (email invites).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config({ path: require('path').join(__dirname, '../../.env.local') });

const { clerkClient } = require('@clerk/express');
const models = require('../models');

async function ensureClerkUser(email, name) {
  if (!email) return { skipped: true, reason: 'no_email' };
  try {
    // Search by email
    const existing = await clerkClient.users.getUserList({ emailAddress: [email] });
    if (existing && existing.length) {
      return { ok: true, userId: existing[0].id, existed: true };
    }
  } catch (_) { /* ignore */ }

    // Create user with email only; Clerk will send invitation if configured
  const created = await clerkClient.users.createUser({
    emailAddress: [email],
    firstName: name?.split(' ')?.[0] || undefined,
    lastName: name?.split(' ')?.slice(1).join(' ') || undefined,
    skipPassword: true,
    skipEmailLink: false
  });
  return { ok: true, userId: created.id, existed: false };
}

async function main() {
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY missing');
    process.exit(1);
  }
  await models.sequelize.authenticate();
  const results = { admins: 0, teachers: 0, students: 0, created: 0, existing: 0, errors: 0 };

  // Admins
  const admins = await models.Admin.findAll();
  for (const a of admins) {
    try {
      const r = await ensureClerkUser(a.email, a.name || a.username);
      if (r.ok) { results.admins++; r.existed ? results.existing++ : results.created++; }
    } catch (e) { results.errors++; console.warn('Admin migrate failed', a.email, e.message); }
  }
  // Teachers
  const teachers = await models.Teacher.findAll();
  for (const t of teachers) {
    try {
      const r = await ensureClerkUser(t.email, t.name);
      if (r.ok) { results.teachers++; r.existed ? results.existing++ : results.created++; }
    } catch (e) { results.errors++; console.warn('Teacher migrate failed', t.email, e.message); }
  }
  // Students
  const students = await models.Student.findAll();
  for (const s of students) {
    try {
      const r = await ensureClerkUser(s.email, s.name || s.id);
      if (r.ok) { results.students++; r.existed ? results.existing++ : results.created++; }
    } catch (e) { results.errors++; console.warn('Student migrate failed', s.email, e.message); }
  }

  console.log('Clerk migration summary:', results);
  await models.sequelize.close();
}

main().catch((e) => { console.error('Migration failed:', e); process.exit(1); });
