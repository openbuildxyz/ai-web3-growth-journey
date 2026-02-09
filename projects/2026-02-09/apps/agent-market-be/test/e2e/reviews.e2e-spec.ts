import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/Database/prisma.service'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import { ethers } from 'ethers'
import { randomUUID } from 'crypto'

describe('ReviewsController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  let buyerToken: string
  let buyerUserId: string
  let sellerToken: string
  let agentId: string
  let completedTaskId: string
  let createdTaskId: string

  let sellerUserId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    app.useGlobalInterceptors(new ResponseInterceptor())
    prisma = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // Setup Buyer
    const buyerWallet = ethers.Wallet.createRandom()
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

    // Setup Seller
    const sellerWallet = ethers.Wallet.createRandom()
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
  })

  beforeEach(async () => {
    // Create Agent
    const agentRes = await request(app.getHttpServer())
      .post('/agents')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        display_name: 'Review E2E Agent',
        base_url: 'http://test.com',
        invoke_path: '/run',
        auth_secret_hash: 'review-secret',
        user_id: sellerUserId,
      })
    agentId = agentRes.body.id

    // Create a completed task for review testing
    const task = await prisma.tasks.create({
      data: {
        id: randomUUID(),
        title: 'Completed Task',
        buyer_id: buyerUserId,
        agent_id: agentId,
        status: 'completed',
        chain_id: 1,
        budget_usd: 10,
        create_tx_hash: '0x' + 'a'.repeat(64),
      },
    })
    completedTaskId = task.id

    const anotherTask = await prisma.tasks.create({
      data: {
        id: randomUUID(),
        title: 'Created Task',
        buyer_id: buyerUserId,
        agent_id: agentId,
        status: 'created',
        chain_id: 1,
        budget_usd: 10,
        create_tx_hash: '0x' + 'b'.repeat(64),
      },
    })
    createdTaskId = anotherTask.id
  })

  afterEach(async () => {
    await prisma.reviews.deleteMany({ where: { reviewer_id: buyerUserId } })
    await prisma.tasks.deleteMany({ where: { buyer_id: buyerUserId } })
    await prisma.agents.delete({ where: { id: agentId } })
  })

  afterAll(async () => {
    await prisma.users.deleteMany({
      where: { id: { in: [buyerUserId, sellerUserId] } },
    })
    await app.close()
  })

  describe('POST /tasks/:id/review', () => {
    it('should allow buyer to create a review for a completed task', () => {
      return request(app.getHttpServer())
        .post(`/tasks/${completedTaskId}/review`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5, feedback: 'Fantastic!' })
        .expect(201)
        .then((res) => {
          expect(res.body.rating).toBe(5)
          expect(res.body.feedback).toBe('Fantastic!')
          expect(res.body.task_id).toBe(completedTaskId)
        })
    })

    it('should return 400 if task is not completed', () => {
      return request(app.getHttpServer())
        .post(`/tasks/${createdTaskId}/review`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5, feedback: 'Too early!' })
        .expect(400)
    })

    it('should return 403 if user is not the buyer', () => {
      return request(app.getHttpServer())
        .post(`/tasks/${completedTaskId}/review`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ rating: 1, feedback: 'Trying to review my own work' })
        .expect(403)
    })

    it('should return 400 if task is already reviewed', () => {
      return request(app.getHttpServer())
        .post(`/tasks/${completedTaskId}/review`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 4, feedback: 'First review' })
        .expect(201)
        .then(() => {
          return request(app.getHttpServer())
            .post(`/tasks/${completedTaskId}/review`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ rating: 4, feedback: 'One more time' })
            .expect(400)
        })
    })

    it('should return 404 if task does not exist', () => {
      return request(app.getHttpServer())
        .post(`/tasks/${randomUUID()}/review`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 4, feedback: 'for a ghost task' })
        .expect(404)
    })
  })

  describe('GET /agents/:id/reviews', () => {
    it('should return a list of reviews for an agent', async () => {
      await request(app.getHttpServer())
        .post(`/tasks/${completedTaskId}/review`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5, feedback: 'Fantastic!' })
        .expect(201)

      const res = await request(app.getHttpServer())
        .get(`/agents/${agentId}/reviews`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200)

      expect(res.body.items).toBeInstanceOf(Array)
      expect(res.body.items.length).toBeGreaterThan(0)
      expect(res.body.items[0].agent_id).toBe(agentId)
      expect(res.body.total).toBe(1)
    })

    it('should return empty list for an agent with no reviews', async () => {
      const newAgent = await prisma.agents.create({
        data: {
          id: randomUUID(),
          user_id: buyerUserId, // just for association
          display_name: 'New Guy',
          base_url: 'http://new.com',
          invoke_path: '/new',
          auth_secret_hash: 'new-agent-secret',
        },
      })

      const res = await request(app.getHttpServer())
        .get(`/agents/${newAgent.id}/reviews`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200)

      expect(res.body.items.length).toBe(0)
      expect(res.body.total).toBe(0)

      await prisma.agents.delete({ where: { id: newAgent.id } })
    })
  })
})
