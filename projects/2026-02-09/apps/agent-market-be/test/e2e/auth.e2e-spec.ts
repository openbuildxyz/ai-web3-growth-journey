import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let wallet: ethers.HDNodeWallet

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // Create a random wallet for testing
    wallet = ethers.Wallet.createRandom()
  })

  afterAll(async () => {
    // Cleanup: Delete the user created during the test
    await prismaService.users.deleteMany({
      where: { wallet_address: wallet.address },
    })
    await app.close()
  })

  let nonce: string
  let accessToken: string

  it('/auth/challenge (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: wallet.address })
      .expect(201)

    expect(response.body).toHaveProperty('nonce')
    expect(response.body).toHaveProperty('message')

    nonce = response.body.nonce
    const message = response.body.message

    // Check format
    expect(message).toContain(wallet.address)
    expect(message).toContain(nonce)
  })

  it('/auth/login (POST)', async () => {
    // Reconstruct the message as expected by the server
    const message = `Web3 Agent Market 登录验证\n\n地址: ${wallet.address}\nNonce: ${nonce}`
    const signature = await wallet.signMessage(message)

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        address: wallet.address,
        nonce: nonce,
        signature: signature,
      })
      .expect(201)

    expect(response.body).toHaveProperty('accessToken')
    accessToken = response.body.accessToken

    // Verify user exists in DB
    const user = await prismaService.users.findUnique({
      where: { wallet_address: wallet.address },
    })
    expect(user).toBeDefined()
    expect(user?.role).toBe('buyer') // Default role
  })

  it('/auth/login (POST) - with role', async () => {
    // New wallet for this test
    const sellerWallet = ethers.Wallet.createRandom()

    // 1. Challenge
    const challengeRes = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: sellerWallet.address })
      .expect(201)

    const { nonce: nonce2, message: message2 } = challengeRes.body

    // 2. Login with role 'seller'
    const signature2 = await sellerWallet.signMessage(message2)
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        address: sellerWallet.address,
        nonce: nonce2,
        signature: signature2,
        role: 'seller',
      })
      .expect(201)

    expect(response.body).toHaveProperty('accessToken')

    // Verify user created with seller role
    const user = await prismaService.users.findUnique({
      where: { wallet_address: sellerWallet.address },
    })
    expect(user).toBeDefined()
    expect(user?.role).toBe('seller')

    // Cleanup
    await prismaService.users.deleteMany({
      where: { wallet_address: sellerWallet.address },
    })
  })
})
