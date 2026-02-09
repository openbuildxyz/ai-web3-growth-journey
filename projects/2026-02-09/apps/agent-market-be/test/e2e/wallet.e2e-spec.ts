import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import { DepositIntentDto } from '../../src/Modules/Wallet/dto/wallet.dto'

describe('WalletController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService

  let wallet: ethers.Wallet
  let token: string
  let userId: string

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
  })

  afterAll(async () => {
    if (userId) {
      await prismaService.payments.deleteMany({ where: { user_id: userId } })
      await prismaService.wallet_balances.deleteMany({
        where: { user_id: userId },
      })
      await prismaService.users.delete({ where: { id: userId } })
    }
    await app.close()
  })

  describe('/wallet/deposit/intent (POST)', () => {
    it('should create a deposit intent successfully', async () => {
      const dto: DepositIntentDto = {
        amount: 200,
        token_symbol: 'ETH',
        chain_id: 1,
      }

      const response = await request(app.getHttpServer())
        .post('/wallet/deposit/intent')
        .set('Authorization', `Bearer ${token}`)
        .send(dto)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.user_id).toBe(userId)
      expect(response.body.amount).toBe('200')
      expect(response.body.token_symbol).toBe(dto.token_symbol)
      expect(response.body.chain_id).toBe(dto.chain_id)
      expect(response.body.status).toBe('pending')
    })

    it('should fail without authorization', () => {
      const dto: DepositIntentDto = {
        amount: 200,
        token_symbol: 'ETH',
        chain_id: 1,
      }
      return request(app.getHttpServer())
        .post('/wallet/deposit/intent')
        .send(dto)
        .expect(401)
    })

    it('should fail with invalid data', async () => {
      const dto = {
        amount: 'a lot',
      }
      await request(app.getHttpServer())
        .post('/wallet/deposit/intent')
        .set('Authorization', `Bearer ${token}`)
        .send(dto)
        .expect(400)
    })
  })

  describe('/wallet/balance (GET)', () => {
    it('should return zero balance for a new user', () => {
      return request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            available: '0',
            locked: '0',
          })
        })
    })

    it('should return the correct balance after updating', async () => {
      await prismaService.wallet_balances.create({
        data: {
          user_id: userId,
          available: '500.50',
          locked: '100.25',
        },
      })

      return request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            available: '500.5',
            locked: '100.25',
          })
        })
    })

    it('should fail without authorization', () => {
      return request(app.getHttpServer()).get('/wallet/balance').expect(401)
    })
  })
})
