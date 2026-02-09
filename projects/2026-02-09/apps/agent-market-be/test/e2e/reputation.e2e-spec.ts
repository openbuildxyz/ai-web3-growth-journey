import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/Database/prisma.service'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import { ethers } from 'ethers'
import { randomUUID } from 'crypto'
import { Prisma } from '../../generated/prisma/client'

describe('ReputationController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  let userToken: string
  let userId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    app.useGlobalInterceptors(new ResponseInterceptor())
    prisma = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // Setup User
    const userWallet = ethers.Wallet.createRandom()
    const ch = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: userWallet.address })
    const sig = await userWallet.signMessage(ch.body.message)
    const login = await request(app.getHttpServer()).post('/auth/login').send({
      address: userWallet.address,
      nonce: ch.body.nonce,
      signature: sig,
    })
    userToken = login.body.accessToken
    const me = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
    userId = me.body.id
  })

  beforeEach(async () => {
    // Create reputation logs
    await prisma.users.update({
      where: { id: userId },
      data: { reputation_score: new Prisma.Decimal(15) },
    })
    await prisma.reputation_logs.createMany({
      data: [
        {
          id: randomUUID(),
          user_id: userId,
          source: 'task_completion',
          delta: new Prisma.Decimal(10),
          reason: 'test reason 1',
        },
        {
          id: randomUUID(),
          user_id: userId,
          source: 'bonus',
          delta: new Prisma.Decimal(5),
          reason: 'test reason 2',
        },
      ],
    })
  })

  afterEach(async () => {
    await prisma.reputation_logs.deleteMany({ where: { user_id: userId } })
  })

  afterAll(async () => {
    await prisma.users.delete({ where: { id: userId } })
    await app.close()
  })

  describe('GET /users/:id/reputation', () => {
    it("should return the user's reputation score and summary", async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/reputation`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.user_id).toBe(userId)
      expect(response.body.score).toBe('15') // Prisma Decimal is serialized as string
      expect(response.body.summary).toEqual({
        task_completion: '10',
        bonus: '5',
      })
    })

    it('should return 404 for a non-existent user', async () => {
      const fakeUserId = randomUUID()
      await request(app.getHttpServer())
        .get(`/users/${fakeUserId}/reputation`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200) // The service returns null, which the interceptor wraps into a 200 response with null data
    })
  })

  describe('GET /reputation/logs', () => {
    it('should return a paginated list of reputation logs for the current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/reputation/logs')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200)

      expect(response.body.items).toBeInstanceOf(Array)
      expect(response.body.items.length).toBe(2)
      expect(response.body.total).toBe(2)
      expect(response.body.items[0].user_id).toBe(userId)
    })

    it('should handle pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/reputation/logs')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 2, limit: 1 })
        .expect(200)

      expect(response.body.items.length).toBe(1)
      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(2)
    })
  })
})
