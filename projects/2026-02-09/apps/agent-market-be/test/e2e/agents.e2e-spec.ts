import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'
import { CreateAgentDto } from '../../src/Modules/Agents/dto/agent.dto'
import { randomUUID } from 'crypto'

describe('AgentsController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let wallet: ethers.HDNodeWallet
  let accessToken: string
  let userId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    wallet = ethers.Wallet.createRandom()

    // 1. Auth Login
    const challengeRes = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: wallet.address })
    const { nonce, message } = challengeRes.body
    const signature = await wallet.signMessage(message)
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ address: wallet.address, nonce, signature })
    accessToken = loginRes.body.accessToken

    // Get User ID to upgrade role
    const meRes = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
    userId = meRes.body.id

    // 2. Upgrade to Seller
    await prismaService.users.update({
      where: { id: userId },
      data: { role: 'seller' },
    })
    // Need to re-login to update JWT payload?
    // Usually JWT contains role, so yes.

    // Re-login to get new token with seller role
    const challengeRes2 = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: wallet.address })
    const { nonce: nonce2, message: message2 } = challengeRes2.body
    const signature2 = await wallet.signMessage(message2)
    const loginRes2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ address: wallet.address, nonce: nonce2, signature: signature2 })
    accessToken = loginRes2.body.accessToken
  })

  afterAll(async () => {
    // Cleanup
    if (userId) {
      const agentIds = (
        await prismaService.agents.findMany({
          where: { user_id: userId },
          select: { id: true },
        })
      ).map((agent) => agent.id)
      if (agentIds.length > 0) {
        await prismaService.tasks.deleteMany({
          where: { agent_id: { in: agentIds } },
        })
      }
      await prismaService.agents.deleteMany({
        where: { user_id: userId },
      })
    }
    await prismaService.users.deleteMany({
      where: { wallet_address: wallet.address },
    })
    await app.close()
  })

  let agentId: string

  it('/agents (POST) - Create Agent', async () => {
    const dto: CreateAgentDto = {
      display_name: 'E2E Agent',
      base_url: 'https://e2e.test',
      invoke_path: '/api/v1/run',
      auth_secret_hash: 'e2e-secret',
      price_per_task: 50,
      bio: 'An automated testing agent',
      tags: ['test', 'e2e'],
    }

    const response = await request(app.getHttpServer())
      .post('/agents')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(201)

    expect(response.body).toHaveProperty('id')
    expect(response.body.display_name).toBe(dto.display_name)
    expect(response.body.tags).toEqual(expect.arrayContaining(['test', 'e2e']))
    agentId = response.body.id
  })

  it('/agents/tags (GET) - List Tags', async () => {
    const response = await request(app.getHttpServer())
      .get('/agents/tags')
      .expect(200)

    expect(response.body).toBeInstanceOf(Array)
    expect(response.body).toEqual(expect.arrayContaining(['test', 'e2e']))
  })

  it('/agents (GET) - List Agents', async () => {
    const response = await request(app.getHttpServer())
      .get('/agents')
      .query({ q: 'E2E', limit: 5 })
      .expect(200)

    expect(response.body.items).toBeInstanceOf(Array)
    expect(response.body.items.length).toBeGreaterThan(0)
    expect(response.body.items[0].display_name).toContain('E2E')
  })

  it('/agents/:id (GET) - Get Details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/agents/${agentId}`)
      .expect(200)

    expect(response.body.id).toBe(agentId)
  })

  it('/agents/:id (PUT) - Update Agent', async () => {
    const response = await request(app.getHttpServer())
      .put(`/agents/${agentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ display_name: 'E2E Agent Updated' })
      .expect(200)

    expect(response.body.display_name).toBe('E2E Agent Updated')
  })

  it('/agents/:id/online (PATCH)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/agents/${agentId}/online`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(response.body.is_online).toBe(true)
  })

  it('/agent/:taskId/generate (GET) - Generate Secret', async () => {
    // Setup: Create a buyer and a task
    const buyerWallet = ethers.Wallet.createRandom()
    const buyerUser = await prismaService.users.create({
      data: {
        id: randomUUID(),
        wallet_address: buyerWallet.address,
        role: 'buyer',
      },
    })
    const task = await prismaService.tasks.create({
      data: {
        id: randomUUID(),
        title: 'E2E Task for Secret',
        description: 'A task to test secret generation',
        budget_usd: 10,
        buyer_id: buyerUser.id,
        agent_id: agentId,
        status: 'created',
      },
    })

    const response = await request(app.getHttpServer())
      .get(`/agent/${task.id}/generate`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(response.body).toHaveProperty('key_id')
    expect(response.body).toHaveProperty('secret')
    expect(typeof response.body.key_id).toBe('string')
    expect(typeof response.body.secret).toBe('string')

    // Verify database
    const updatedAgent = await prismaService.agents.findUnique({
      where: { id: agentId },
    })
    expect(updatedAgent).not.toBeNull()
    expect(updatedAgent?.auth_secret_hash).toBe(response.body.secret)

    // Cleanup the created buyer and task
    await prismaService.tasks.delete({ where: { id: task.id } })
    await prismaService.users.delete({ where: { id: buyerUser.id } })
  })
})
