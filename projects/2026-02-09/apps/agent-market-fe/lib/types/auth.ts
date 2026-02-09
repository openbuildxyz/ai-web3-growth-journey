import { z } from 'zod'

export const AuthChallengeResponse = z
  .object({
    nonce: z.string(),
    message: z.string(),
    expires_in: z.number().optional(),
  })
  .passthrough()

export const AuthLoginRequest = z.object({
  address: z.string(),
  signature: z.string(),
  nonce: z.string(),
})

export const AuthLoginResponse = z
  .object({
    access_token: z.string().optional(),
    token: z.string().optional(),
    jwt: z.string().optional(),
  })
  .passthrough()
