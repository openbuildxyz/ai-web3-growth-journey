import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../Database/prisma.service'
import { randomUUID } from 'crypto'

@Injectable()
export class EscrowService {
  constructor(private readonly prismaService: PrismaService) {}

  async releaseEscrow(taskId: string, userId: string) {
    const prisma = this.prismaService as any
    return prisma.$transaction(async (tx: any) => {
      const escrow = await tx.escrows.findUnique({
        where: { task_id: taskId },
      })

      if (!escrow || escrow.status !== 'locked') {
        return
      }

      await tx.escrows.update({
        where: { task_id: taskId },
        data: {
          status: 'released',
          updated_at: new Date(),
        },
      })

      // Create a payment record for the seller
      const task = await tx.tasks.findUnique({
        where: { id: taskId },
        include: { agents: true },
      })

      if (task?.agent_id && task.agents?.user_id) {
        await tx.payments.create({
          data: {
            id: randomUUID(),
            user_id: task.agents.user_id,
            task_id: taskId,
            type: 'payment',
            amount: escrow.amount,
            status: 'completed',
            description: `Payment for task: ${task.title}`,
            created_at: new Date(),
          },
        })
      }
    })
  }

  async refundEscrow(taskId: string, userId: string) {
    const prisma = this.prismaService as any
    return prisma.$transaction(async (tx: any) => {
      const escrow = await tx.escrows.findUnique({
        where: { task_id: taskId },
      })

      if (!escrow || escrow.status !== 'locked') {
        return
      }

      await tx.escrows.update({
        where: { task_id: taskId },
        data: {
          status: 'refunded',
          updated_at: new Date(),
        },
      })

      // Create a payment record for the buyer
      await tx.payments.create({
        data: {
          id: randomUUID(),
          user_id: userId,
          task_id: taskId,
          type: 'refund',
          amount: escrow.amount,
          status: 'completed',
          description: `Refund for cancelled task: ${taskId}`,
          created_at: new Date(),
        },
      })
    })
  }
}
