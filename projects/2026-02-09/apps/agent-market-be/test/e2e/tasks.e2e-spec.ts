import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'
import { CreateTaskDto } from '../../src/Modules/Tasks/dto/task.dto'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import nock from 'nock'
import { randomUUID } from 'crypto'

describe('TasksController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService

  // Buyer
  let buyerWallet: ethers.HDNodeWallet
  let buyerToken: string
  let buyerUserId: string

  // Seller
  let sellerWallet: ethers.HDNodeWallet
  let sellerToken: string
  let sellerUserId: string
  let agentId: string

  const agentBaseUrl = 'http://test-agent.com'

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new ResponseInterceptor())
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // 1. Setup Buyer
    buyerWallet = ethers.Wallet.createRandom()
    const bCh = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: buyerWallet.address })
    const bSig = await buyerWallet.signMessage(bCh.body.message)
    const bLogin = await request(app.getHttpServer()).post('/auth/login').send({
      address: buyerWallet.address,
      nonce: bCh.body.nonce,
      signature: bSig,
    })
    buyerToken = bLogin.body.accessToken
    const bMe = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${buyerToken}`)
    buyerUserId = bMe.body.id

    // 2. Setup Seller & Agent
    sellerWallet = ethers.Wallet.createRandom()
    const sCh = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: sellerWallet.address })
    const sSig = await sellerWallet.signMessage(sCh.body.message)
    const sLogin = await request(app.getHttpServer()).post('/auth/login').send({
      address: sellerWallet.address,
      nonce: sCh.body.nonce,
      signature: sSig,
      role: 'seller',
    })
    sellerToken = sLogin.body.accessToken
    const sMe = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${sellerToken}`)
    sellerUserId = sMe.body.id

    // Create Agent profile for seller
    const agentRes = await request(app.getHttpServer())
      .post('/agents')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        display_name: 'Task E2E Agent',
        base_url: agentBaseUrl,
        invoke_path: '/run',
        auth_secret_hash: 'task-secret',
        price_per_task: 10,
        tags: ['e2e'],
      })
    agentId = agentRes.body.id
  })

  afterAll(async () => {
    nock.cleanAll()
    await prismaService.tasks.deleteMany({ where: { buyer_id: buyerUserId } })
    await prismaService.agents.deleteMany({ where: { user_id: sellerUserId } })
    await prismaService.users.deleteMany({
      where: { id: { in: [buyerUserId, sellerUserId] } },
    })
    await app.close()
  })

  describe('Task Lifecycle', () => {
    let taskId: string
    const mockTxHash = (
      '0x' +
      randomUUID().replace(/-/g, '') +
      randomUUID().replace(/-/g, '')
    ).slice(0, 66)

    it('/tasks (POST) - Create Task', async () => {
      const dto: CreateTaskDto = {
        title: 'E2E Task',
        description: 'Test Description',
        budget_usd: 100,
        tx_hash: mockTxHash,
        chain_id: 11155111,
      }

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(dto)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.create_tx_hash).toBe(mockTxHash)
      expect(response.body.status).toBe('created')
      taskId = response.body.id
    })

    it('/tasks (GET) - List Tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${buyerToken}`)
        .query({ role: 'buyer', status: 'created' })
        .expect(200)

      expect(response.body.items).toBeInstanceOf(Array)
      const found = response.body.items.find((t: any) => t.id === taskId)
      expect(found).toBeDefined()
    })

    it('/tasks/:id/accept (POST) - Accept Task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/accept`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200)

      expect(response.body.status).toBe('accepted')
      expect(response.body.agent_id).toBe(agentId)
    })

    it('/tasks/:id/deliver (POST) - Deliver Task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/deliver`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Delivery v1',
          content_url: 'http://ipfs.io/hash',
          notes: 'Done',
        })
        .expect(200)

      expect(response.body).toHaveProperty('id')

      // Verify task status
      const taskRes = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
      expect(taskRes.body.task.status).toBe('pending_review')
    })

    it('/tasks/:id/complete (POST) - Complete Task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200)

      expect(response.body.status).toBe('completed')
    })
  })

  describe('/tasks/:id/execute (POST)', () => {
    let taskId: string

    beforeEach(async () => {
      // Create a fresh task for each test to ensure isolation
      const newTaskId = randomUUID()
      const task = await prismaService.tasks.create({
        data: {
          id: newTaskId,
          title: 'Execute Task Test',
          description: 'A task to test execution',
          budget_usd: 50,
          chain_id: 1,
          status: 'created',
          buyer_id: buyerUserId,
          agent_id: agentId,
          create_tx_hash: (
            '0x' +
            randomUUID().replace(/-/g, '') +
            randomUUID().replace(/-/g, '')
          ).slice(0, 66),
        },
      })
      taskId = task.id
    })

    afterEach(async () => {
      nock.cleanAll()
      await prismaService.agent_invocations.deleteMany({
        where: { task_id: taskId },
      })
      await prismaService.escrows.deleteMany({ where: { task_id: taskId } })
      await prismaService.tasks.delete({ where: { id: taskId } })
    })

    it('should execute the task successfully', async () => {
      // 1. Setup task state
      await prismaService.tasks.update({
        where: { id: taskId },
        data: { status: 'pending_review' },
      })
      await prismaService.escrows.create({
        data: {
          id: randomUUID(),
          task_id: taskId,
          amount: 50,
          status: 'locked',
          onchain_tx_hash: '0x' + Array(64).fill('c').join(''),
        },
      })

      // 2. Mock external agent API
      const agentResponse = { result: 'This is the agent output' }
      nock(agentBaseUrl).post('/run').reply(200, agentResponse)

      // 3. Call the endpoint
      const response = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/execute`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ input: 'test input' })
        .expect(200)

      // 4. Assertions
      expect(response.body.output).toEqual(agentResponse)
      expect(nock.isDone()).toBe(true)

      const invocation = await prismaService.agent_invocations.findFirst({
        where: { task_id: taskId },
      })
      expect(invocation).not.toBeNull()
      expect(invocation?.status).toBe('success')
    })

    it('should fail if caller is not the buyer', async () => {
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/execute`)
        .set('Authorization', `Bearer ${sellerToken}`) // Use seller token
        .send({ input: 'test' })
        .expect(403) // Forbidden
    })

    it('should fail if task is not in pending_review state', async () => {
      // Task is in 'created' state by default
      await prismaService.escrows.create({
        data: {
          id: randomUUID(),
          task_id: taskId,
          amount: 50,
          status: 'locked',
        },
      })

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/execute`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ input: 'test' })
        .expect(400) // Bad Request
    })

    it('should fail if escrow is not locked', async () => {
      await prismaService.tasks.update({
        where: { id: taskId },
        data: { status: 'pending_review' },
      })
      // No escrow record created

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/execute`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ input: 'test' })
        .expect(400) // Bad Request
    })

    it('should handle agent API failure', async () => {
      // 1. Setup
      await prismaService.tasks.update({
        where: { id: taskId },
        data: { status: 'pending_review' },
      })
      await prismaService.escrows.create({
        data: {
          id: randomUUID(),
          task_id: taskId,
          amount: 50,
          status: 'locked',
        },
      })

      // 2. Mock
      nock(agentBaseUrl).post('/run').reply(500, { error: 'Server exploded' })

      // 3. Call
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/execute`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ input: 'test' })
        .expect(500)

      // 4. Assert
      const invocation = await prismaService.agent_invocations.findFirst({
        where: { task_id: taskId },
      })
      expect(invocation).not.toBeNull()
      expect(invocation?.status).toBe('failed')
    })
  })
})
