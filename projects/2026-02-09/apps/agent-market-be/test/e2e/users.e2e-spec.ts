import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'

describe('UsersController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let wallet: ethers.HDNodeWallet
  let accessToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    wallet = ethers.Wallet.createRandom()

    // Setup: Login to get token
    // 1. Get Challenge
    const challengeRes = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: wallet.address })

    const { nonce, message } = challengeRes.body

    // 2. Login
    const signature = await wallet.signMessage(message)
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        address: wallet.address,
        nonce,
        signature,
      })

    accessToken = loginRes.body.accessToken
  })

  afterAll(async () => {
    // Cleanup
    await prismaService.users.deleteMany({
      where: { wallet_address: wallet.address },
    })
    await app.close()
  })

  it('/users/me (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(response.body).toHaveProperty('id')
    expect(response.body.wallet_address).toBe(wallet.address)
  })

  it('/users/me (PATCH)', async () => {
    const newEmail = 'test@example.com'
    const response = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: newEmail })
      .expect(200)

    expect(response.body.email).toBe(newEmail)

    // Verify in DB
    const user = await prismaService.users.findUnique({
      where: { wallet_address: wallet.address },
    })
    expect(user?.email).toBe(newEmail)
  })
})
