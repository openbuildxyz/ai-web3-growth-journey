import { z } from 'zod'

import { AuthChallengeResponse, AuthLoginResponse } from '@/lib/types/auth'

export const mockAuthChallenge: z.infer<typeof AuthChallengeResponse> = {
  nonce: 'mock-nonce-123',
  message: 'Sign this message to authenticate.',
  expires_in: 600,
}

export const mockAuthLoginResponse: z.infer<typeof AuthLoginResponse> = {
  access_token: 'mock.jwt.token',
}
