import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import { randomUUID } from 'crypto'

describe('DaoController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService

  let userWallet: ethers.HDNodeWallet
  let userToken: string
  let userId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new ResponseInterceptor())
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // Setup User
    userWallet = ethers.Wallet.createRandom()
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

  afterAll(async () => {
    // Clean up
    await app.close()
  })

  it('/dao/stake/tx (POST) - should accept a stake tx hash', async () => {
    const txHash = '0x' + randomUUID().replace(/-/g, '')
    await request(app.getHttpServer())
      .post('/dao/stake/tx')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ tx_hash: txHash })
      .expect(201)
  })

  it('/dao/members/me (GET) - should return null if not a dao member', async () => {
    const res = await request(app.getHttpServer())
      .get('/dao/members/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(res.body).toEqual({})
  })

  it('/dao/members/me (GET) - should return member info if a dao member', async () => {
    // Manually create a dao member record
    await prismaService.dao_members.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        staked_amount: '1000',
        voting_power: '1000',
      },
    })

    const res = await request(app.getHttpServer())
      .get('/dao/members/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(res.body.user_id).toBe(userId)
    expect(res.body.staked_amount).toBe('1000')
  })
})
