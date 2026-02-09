import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { ethers } from 'ethers'
import { PrismaService } from '../../src/Database/prisma.service'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import { randomUUID } from 'crypto'

describe('ArbitrationController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService

  let buyerWallet: ethers.HDNodeWallet
  let buyerToken: string
  let buyerUserId: string

  let sellerWallet: ethers.HDNodeWallet
  let sellerToken: string

  let daoWallet: ethers.HDNodeWallet
  let daoToken: string
  let daoUserId: string

  let taskId: string
  let arbitrationId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new ResponseInterceptor())
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // Setup Buyer
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

    // Setup Seller
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

    // Setup DAO member
    daoWallet = ethers.Wallet.createRandom()
    const dCh = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: daoWallet.address })
    const dSig = await daoWallet.signMessage(dCh.body.message)
    const dLogin = await request(app.getHttpServer()).post('/auth/login').send({
      address: daoWallet.address,
      nonce: dCh.body.nonce,
      signature: dSig,
      role: 'dao',
    })
    daoToken = dLogin.body.accessToken
    const dMe = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${daoToken}`)
    daoUserId = dMe.body.id

    // Manually create a DAO member record for the test user
    await prismaService.dao_members.create({
      data: {
        id: randomUUID(),
        user_id: daoUserId,
        staked_amount: '1000',
        voting_power: '1000',
        joined_at: new Date(),
      },
    })

    // Create a task and move it to pending_review state
    const task = await prismaService.tasks.create({
      data: {
        id: randomUUID(),
        title: 'dispute task',
        description: 'desc',
        budget_usd: 10,
        status: 'pending_review',
        buyer_id: buyerUserId,
      },
    })
    taskId = task.id
  })

  afterAll(async () => {
    // Clean up
    await prismaService.arbitration_votes.deleteMany({
      where: { arbitration_id: arbitrationId },
    })
    await prismaService.arbitrations.deleteMany({ where: { task_id: taskId } })
    await prismaService.tasks.deleteMany({ where: { buyer_id: buyerUserId } })
    await prismaService.users.deleteMany({
      where: { id: { in: [buyerUserId, daoUserId] } },
    })
    await app.close()
  })

  it('/tasks/:id/dispute (POST) - should allow buyer to dispute a task', async () => {
    await request(app.getHttpServer())
      .post(`/tasks/${taskId}/dispute`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ tx_hash: '0xdispute' })
      .expect(201)

    const task = await prismaService.tasks.findUnique({ where: { id: taskId } })
    expect(task.status).toBe('disputed')
  })

  it('/arbitrations (GET) - should not allow non-dao member to list', async () => {
    await request(app.getHttpServer())
      .get('/arbitrations')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(403)
  })

  it('/arbitrations (GET) - should allow dao member to list', async () => {
    // Manually create an arbitration case for testing
    const createdArbitration = await prismaService.arbitrations.create({
      data: {
        id: randomUUID(),
        task_id: taskId,
        opened_by: buyerUserId,
        status: 'voting',
        amount_disputed: '10',
        opened_at: new Date(),
      },
    })
    arbitrationId = createdArbitration.id

    const res = await request(app.getHttpServer())
      .get('/arbitrations')
      .set('Authorization', `Bearer ${daoToken}`)
      .expect(200)

    expect(res.body.items).toBeInstanceOf(Array)
    expect(res.body.items.length).toBeGreaterThan(0)
  })

  it('/arbitrations/:id (GET) - should return arbitration details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/arbitrations/${arbitrationId}`)
      .set('Authorization', `Bearer ${daoToken}`)
      .expect(200)

    expect(res.body.arbitration.id).toBe(arbitrationId)
  })

  it('/arbitrations/:id/vote (POST) - should allow dao member to vote', async () => {
    await request(app.getHttpServer())
      .post(`/arbitrations/${arbitrationId}/vote`)
      .set('Authorization', `Bearer ${daoToken}`)
      .send({ support: 'buyer', tx_hash: '0xvote' })
      .expect(201)
  })

  it('/arbitrations/:id/vote (POST) - should not allow voting twice', async () => {
    await request(app.getHttpServer())
      .post(`/arbitrations/${arbitrationId}/vote`)
      .set('Authorization', `Bearer ${daoToken}`)
      .send({ support: 'buyer', tx_hash: '0xvote2' })
      .expect(400)
  })
})
