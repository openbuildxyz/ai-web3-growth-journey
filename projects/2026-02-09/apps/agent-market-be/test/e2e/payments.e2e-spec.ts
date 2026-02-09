import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import { randomUUID } from 'crypto'
import { $Enums, payments } from '../../generated/prisma/client'

describe('PaymentsController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService

  let wallet: ethers.Wallet
  let token: string
  let userId: string

  let paymentRecord: payments

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new ResponseInterceptor())
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // Setup User
    wallet = ethers.Wallet.createRandom()
    const challenge = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: wallet.address })
    const signature = await wallet.signMessage(challenge.body.message)
    const login = await request(app.getHttpServer()).post('/auth/login').send({
      address: wallet.address,
      nonce: challenge.body.nonce,
      signature: signature,
    })
    token = login.body.accessToken
    const me = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
    userId = me.body.id

    // Create a payment record for testing
    paymentRecord = await prismaService.payments.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type: $Enums.payment_type.deposit,
        amount: 150,
        token_symbol: 'MATIC',
        chain_id: 137,
        status: $Enums.payment_status.pending,
      },
    })
  })

  afterAll(async () => {
    if (userId) {
      await prismaService.payments.deleteMany({ where: { user_id: userId } })
      await prismaService.users.delete({ where: { id: userId } })
    }
    await app.close()
  })

  describe('/payments (GET)', () => {
    it('should list payments for the current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.items).toBeInstanceOf(Array)
      expect(response.body.total).toBeGreaterThan(0)
      const found = response.body.items.find(
        (p: any) => p.id === paymentRecord.id,
      )
      expect(found).toBeDefined()
    })

    it('should filter payments by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${token}`)
        .query({ status: 'pending' })
        .expect(200)

      expect(response.body.total).toBeGreaterThan(0)
      expect(
        response.body.items.every((p: any) => p.status === 'pending'),
      ).toBe(true)
    })

    it('should return empty list for a status with no payments', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${token}`)
        .query({ status: 'completed' })
        .expect(200)

      expect(response.body.total).toBe(0)
      expect(response.body.items).toHaveLength(0)
    })

    it('should fail without authorization', () => {
      return request(app.getHttpServer()).get('/payments').expect(401)
    })
  })

  describe('/payments/:id/tx (POST)', () => {
    const txHash = '0x' + randomUUID().replace(/-/g, '')

    it('should record the transaction hash for a payment', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payments/${paymentRecord.id}/tx`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tx_hash: txHash })
        .expect(200)

      expect(response.body.id).toBe(paymentRecord.id)
      expect(response.body.tx_hash).toBe(txHash)
    })

    it('should fail if payment id does not exist', () => {
      const randomId = randomUUID()
      return request(app.getHttpServer())
        .post(`/payments/${randomId}/tx`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tx_hash: txHash })
        .expect(404)
    })

    it("should fail if trying to update another user's payment", async () => {
      // Create another user and payment
      const otherWallet = ethers.Wallet.createRandom()
      const otherUserChallenge = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: otherWallet.address })
      const otherUserSignature = await otherWallet.signMessage(
        otherUserChallenge.body.message,
      )
      const otherLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: otherWallet.address,
          nonce: otherUserChallenge.body.nonce,
          signature: otherUserSignature,
        })
      const otherUserRes = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
      const otherUserId = otherUserRes.body.id

      const otherPayment = await prismaService.payments.create({
        data: {
          id: randomUUID(),
          user_id: otherUserId,
          type: $Enums.payment_type.deposit,
          amount: 50,
          token_symbol: 'DAI',
          chain_id: 1,
          status: $Enums.payment_status.pending,
        },
      })

      await request(app.getHttpServer())
        .post(`/payments/${otherPayment.id}/tx`)
        .set('Authorization', `Bearer ${token}`) // Using original user's token
        .send({ tx_hash: txHash })
        .expect(400) // Bad Request, as per service logic for permission denial

      await prismaService.payments.delete({ where: { id: otherPayment.id } })
      await prismaService.users.delete({ where: { id: otherUserId } })
    })

    it('should fail without authorization', () => {
      return request(app.getHttpServer())
        .post(`/payments/${paymentRecord.id}/tx`)
        .send({ tx_hash: txHash })
        .expect(401)
    })
  })
})
