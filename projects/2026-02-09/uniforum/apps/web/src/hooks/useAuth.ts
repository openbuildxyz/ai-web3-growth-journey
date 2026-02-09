/**
 * Auth Hook
 *
 * Unified authentication hook using Privy.
 * Provides user info, login/logout, wallet access, and access token for API calls.
 */

'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email?: string;
  wallet?: {
    address: string;
    walletClientType: string;
  };
  linkedAccounts: Array<{
    type: string;
    address?: string;
    email?: string | null;
  }>;
}

export function useAuth() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkWallet,
    unlinkWallet,
    getAccessToken,
  } = usePrivy();

  const { wallets } = useWallets();

  // Get the user's primary wallet (embedded or external)
  const primaryWallet = useMemo(() => {
    if (!wallets.length) return null;

    // Prefer embedded wallet, then external
    const embedded = wallets.find((w) => w.walletClientType === 'privy');
    return embedded || wallets[0];
  }, [wallets]);

  // Format user data
  const authUser: AuthUser | null = useMemo(() => {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email?.address,
      wallet: primaryWallet
        ? {
            address: primaryWallet.address,
            walletClientType: primaryWallet.walletClientType,
          }
        : undefined,
      linkedAccounts: user.linkedAccounts.map((account) => ({
        type: account.type,
        address: 'address' in account ? account.address : undefined,
        email: 'email' in account ? account.email : undefined,
      })),
    };
  }, [user, primaryWallet]);

  /**
   * Get access token for API calls
   * Returns null if not authenticated
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!authenticated) return null;
    try {
      return await getAccessToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }, [authenticated, getAccessToken]);

  return {
    // State
    ready,
    authenticated,
    user: authUser,
    wallets,
    primaryWallet,

    // Actions
    login,
    logout,
    linkWallet,
    unlinkWallet,

    // Token for API calls
    getToken,

    // Helpers
    isLoading: !ready,
    hasWallet: !!primaryWallet,
    walletAddress: primaryWallet?.address,
  };
}

/**
 * Get wallet address for API calls
 */
export function useWalletAddress(): string | null {
  const { primaryWallet } = useAuth();
  return primaryWallet?.address || null;
}
