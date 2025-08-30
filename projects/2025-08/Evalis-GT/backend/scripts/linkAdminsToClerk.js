/**
 * Link existing Admins to Clerk users by email and attach clerkId in DB.
 * - If admin.clerkId exists, skip.
 * - Else, try to find Clerk user by email; if found, set clerkId.
 * - If not found, create Clerk user and set clerkId; optionally send reset.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config({ path: require('path').join(__dirname, '../../.env.local') });

const { clerkClient } = require('@clerk/express');
const models = require('../models');

async function findClerkUserByEmail(email) {
  const norm = (email || '').trim().toLowerCase();
  if (!norm) return null;
  try {
    const list = await clerkClient.users.getUserList({ emailAddress: [norm], limit: 10 });
    if (Array.isArray(list) && list.length > 0) return list[0];
  } catch (_) { /* ignore */ }
  // Fallback: use free-text query search if supported
  try {
    const list2 = await clerkClient.users.getUserList({ query: norm, limit: 10 });
    if (Array.isArray(list2) && list2.length > 0) {
      const hit = list2.find(u => (u?.emailAddresses || []).some(e => (e.emailAddress || '').toLowerCase() === norm));
      if (hit) return hit;
    }
  } catch (_) { /* ignore */ }
  return null;
}

async function listClerkUsersSample(limit = 50) {
  try {
    const users = await clerkClient.users.getUserList({ limit });
    console.log(`Found ${users.length} Clerk users (showing up to ${limit}):`);
    users.forEach((u) => {
      const emails = (u.emailAddresses || []).map(e => e.emailAddress).join(', ');
      console.log(`- ${u.id}: ${emails}`);
    });
  } catch (e) {
    console.warn('Failed to list Clerk users:', e.message);
  }
}

async function main() {
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY missing. Aborting.');
    process.exit(1);
  }
  await models.sequelize.authenticate();

  const summary = {
    totalAdmins: 0,
    alreadyLinked: 0,
    linkedExisting: 0,
    createdAndLinked: 0,
    skippedNoEmail: 0,
    errors: 0,
    errorDetails: []
  };

  const admins = await models.Admin.findAll();
  summary.totalAdmins = admins.length;

  for (const admin of admins) {
    try {
      if (!admin.email) {
        summary.skippedNoEmail++;
        continue;
      }
      if (admin.clerkId) {
        summary.alreadyLinked++;
        continue;
      }

      // Try to find existing Clerk user
      let clerkUser = await findClerkUserByEmail(admin.email);
      if (!clerkUser) {
        // Create a new Clerk user
        const nameParts = (admin.name || '').split(' ');
        try {
          clerkUser = await clerkClient.users.createUser({
            emailAddress: [admin.email.trim().toLowerCase()],
            firstName: nameParts[0] || 'Admin',
            lastName: nameParts.slice(1).join(' ') || '',
            publicMetadata: { role: 'admin', username: admin.username }
          });
          summary.createdAndLinked++;
          // Try to send a password reset/invite (best effort)
          try {
            await clerkClient.users.createEmailPasswordReset({ userId: clerkUser.id, expiresInMs: 7 * 24 * 60 * 60 * 1000 });
          } catch (_) { /* ignore */ }
        } catch (createErr) {
          // If creation failed (e.g., already exists), try to find again and link
          const code = createErr?.status || createErr?.code || createErr?.response?.status;
          const msg = createErr?.message || 'unknown';
          console.warn(`Create Clerk user failed for ${admin.email}: [${code}] ${msg}`);
          clerkUser = await findClerkUserByEmail(admin.email);
          if (!clerkUser) throw createErr;
          summary.linkedExisting++;
        }
      } else {
        summary.linkedExisting++;
      }

      // Persist clerkId on Admin
      await admin.update({ clerkId: clerkUser.id });
      console.log(`Linked admin ${admin.username} <${admin.email}> to Clerk ${clerkUser.id}`);
    } catch (e) {
      summary.errors++;
      const detail = e?.response?.data || e?.errors || e?.data || null;
      summary.errorDetails.push({ admin: admin.username || admin.id, email: admin.email, error: e.message, detail });
      console.warn(`Failed to link admin ${admin.username || admin.id}: ${e.message}`);
      if (detail) {
        try { console.warn('Detail:', JSON.stringify(detail, null, 2)); } catch (_) {}
      }
    }
  }

  console.log('Admin→Clerk link summary:', summary);
  await models.sequelize.close();
  if (summary.errors > 0) {
    console.log('\nListing Clerk users to help pick the right account to link:');
    await listClerkUsersSample();
  }
}

main().catch((e) => { console.error('Linking failed:', e); process.exit(1); });
