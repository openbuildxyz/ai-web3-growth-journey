import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import nock from 'nock'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/Database/prisma.service'
import { ethers } from 'ethers'
import { randomUUID } from 'crypto'
import { users as User, agents as Agent, tasks as Task } from '@prisma/client'
import { createHmac } from 'crypto'
import { ConfigService } from '@nestjs/config'

describe('AgentInvocationController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  let buyer: User
  let seller: User
  let agent: Agent
  let task: Task
  let buyerToken: string
  let sellerToken: string
  let buyerWallet: ethers.Wallet // Declared globally
  let sellerWallet: ethers.Wallet // Declared globally

  const agentApiBaseUrl = 'http://fake-agent-api.com'
  const TEST_JWT_SECRET = 'e2e-test-secret' // Define a fixed secret for testing

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ JWT_SECRET: 'e2e-test-secret' }))
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    // 1. Setup wallets and then users
    buyerWallet = ethers.Wallet.createRandom()
    sellerWallet = ethers.Wallet.createRandom()
    ;[buyer, seller] = await Promise.all([
      prisma.users.create({
        data: {
          id: randomUUID(),
          wallet_address: buyerWallet.address,
          role: 'buyer',
        },
      }),
      prisma.users.create({
        data: {
          id: randomUUID(),
          wallet_address: sellerWallet.address,
          role: 'seller',
        },
      }),
    ])

    // 2. Setup agent with HMAC auth
    agent = await prisma.agents.create({
      data: {
        id: randomUUID(),
        user_id: seller.id,
        display_name: 'E2E Invocation Agent',
        base_url: agentApiBaseUrl,
        invoke_path: '/invoke',
        auth_type: 'platform_hmac',
        auth_secret_hash: 'invocation-secret',
        tags: [],
      },
    })

    // 3. Setup task in 'pending_review' status with locked escrow
    task = await prisma.tasks.create({
      data: {
        id: randomUUID(),
        buyer_id: buyer.id,
        agent_id: agent.id,
        title: 'E2E Invocation Task',
        status: 'pending_review',
        budget_usd: 10,
      },
    })
    await prisma.escrows.create({
      data: {
        task_id: task.id,
        status: 'locked',
        amount: 10,
      },
    })

    // 4. Login as buyer
    const challengeResBuyer = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: buyerWallet.address })
    const { nonce: nonceBuyer, message: messageBuyer } = challengeResBuyer.body
    const signatureBuyer = await buyerWallet.signMessage(messageBuyer)
    const loginResBuyer = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        address: buyerWallet.address,
        signature: signatureBuyer,
        nonce: nonceBuyer,
        role: 'buyer',
      })
    buyerToken = loginResBuyer.body.accessToken

    // Verify buyer token
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200)

    // 5. Login as seller
    const challengeResSeller = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: sellerWallet.address })
    const { nonce: nonceSeller, message: messageSeller } =
      challengeResSeller.body
    const signatureSeller = await sellerWallet.signMessage(messageSeller)
    const loginResSeller = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        address: sellerWallet.address,
        signature: signatureSeller,
        nonce: nonceSeller,
        role: 'seller',
      })
    sellerToken = loginResSeller.body.accessToken
  })

  afterAll(async () => {
    nock.cleanAll()
    // Clean up in the correct order to avoid foreign key violations
    if (task?.id) {
      await prisma.escrows.deleteMany({ where: { task_id: task.id } })
      await prisma.tasks.deleteMany({ where: { buyer_id: task.buyer_id } })
    }
    if (seller?.id) {
      await prisma.agents.deleteMany({ where: { user_id: seller.id } })
    }
    if (buyer?.id || seller?.id) {
      await prisma.users.deleteMany({
        where: {
          id: { in: [buyer?.id, seller?.id].filter(Boolean) as string[] },
        },
      })
    }
    await app.close()
  })

  describe('/tasks/:id/execute (POST)', () => {
    const executePayload = { command: 'do-something' }

    it('should fail if task is not in pending_review state', async () => {
      // Temporarily update task status
      await prisma.tasks.update({
        where: { id: task.id },
        data: { status: 'created' },
      })

      await request(app.getHttpServer())
        .post(`/tasks/${task.id}/execute`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(executePayload)
        .expect(400)

      // Revert status for other tests
      await prisma.tasks.update({
        where: { id: task.id },
        data: { status: 'pending_review' },
      })
    })

    it('should fail if not called by the buyer', async () => {
      await request(app.getHttpServer())
        .post(`/tasks/${task.id}/execute`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(executePayload)
        .expect(403)
    })

    it('should successfully invoke the agent with correct HMAC signature', async () => {
      const agentInvocationPayload = {
        task_id: task.id,
        input: executePayload,
      }

      const expectedSignature = createHmac('sha256', agent.auth_secret_hash)
        .update(JSON.stringify(agentInvocationPayload))
        .digest('hex')

      const agentApiMock = nock(agentApiBaseUrl)
        .post('/invoke', (body) => {
          expect(body).toEqual(agentInvocationPayload)
          return true
        })
        .matchHeader('X-Signature', expectedSignature)
        .reply(200, { result: 'job done' })

      const response = await request(app.getHttpServer())
        .post(`/tasks/${task.id}/execute`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(executePayload)
        .expect(200)

      expect(response.body.output).toEqual({ result: 'job done' })
      expect(agentApiMock.isDone()).toBe(true)

      const invocation = await prisma.agent_invocations.findFirst({
        where: { task_id: task.id },
      })
      expect(invocation).not.toBeNull()
      expect(invocation?.status).toBe('success')
    })
  })
})
