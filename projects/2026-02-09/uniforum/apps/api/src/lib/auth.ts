import { PrivyClient } from '@privy-io/server-auth';
import { Context, Next } from 'hono';

let privyClient: PrivyClient | null = null;

function getPrivyClient(): PrivyClient {
  if (privyClient) {
    return privyClient;
  }

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error(
      'Missing Privy environment variables. Ensure NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET are set.'
    );
  }

  privyClient = new PrivyClient(appId, appSecret);
  return privyClient;
}

export interface AuthUser {
  userId: string;
  walletAddress?: string;
}

/**
 * Verify Privy JWT token from Authorization header
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const privy = getPrivyClient();
    const verifiedClaims = await privy.verifyAuthToken(token);

    // Get user details
    const user = await privy.getUser(verifiedClaims.userId);

    // Find linked wallet address
    const wallet = user.linkedAccounts.find(
      (account) => account.type === 'wallet'
    );

    return {
      userId: verifiedClaims.userId,
      walletAddress: wallet?.address,
    };
  } catch (error) {
    console.error('[auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Authentication middleware for protected routes
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
      },
      401
    );
  }

  const token = authHeader.replace('Bearer ', '');
  const user = await verifyToken(token);

  if (!user) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      },
      401
    );
  }

  // Attach user to context
  c.set('user', user);

  await next();
}

/**
 * Optional auth middleware - doesn't fail if no token, just sets user if present
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (user) {
      c.set('user', user);
    }
  }

  await next();
}
