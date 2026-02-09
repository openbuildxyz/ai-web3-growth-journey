import { z } from 'zod'

export const ArbitrationCase = z.object({
  id: z.string(), // taskId as string
  taskId: z.string(), // taskId for contract calls
  taskTitle: z.string(),
  buyerAddress: z.string(),
  sellerAddress: z.string(), // agent address
  amount: z.number(), // formatted amount with decimals
  amountRaw: z.bigint().optional(), // raw amount from contract
  reason: z.string().optional(), // optional, may come from off-chain
  status: z.enum(['voting', 'resolved_buyer', 'resolved_seller']),
  votesForBuyer: z.number(),
  votesForSeller: z.number(),
  quorum: z.number(), // quorum requirement
  deadline: z.number(), // timestamp
  deadlineDisplay: z.string().optional(), // formatted deadline string
  finalized: z.boolean(),
  result: z.number().optional(), // ArbitrationDecision enum value
  evidence: z.string().array().optional(),
})

export type ArbitrationCase = z.infer<typeof ArbitrationCase>

export const DaoMember = z.object({
  address: z.string(),
  votingPower: z.number(), // staked amount
  avatar: z.string().optional(),
})

export type DaoMember = z.infer<typeof DaoMember>
