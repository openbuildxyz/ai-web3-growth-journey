import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/Database/prisma.service'
import { ResponseInterceptor } from '../../src/Common/interceptors/response.interceptor'
import { ethers } from 'ethers'
import { randomUUID } from 'crypto'
import { $Enums } from '../../generated/prisma/client'

describe('NotificationsController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  let userToken: string
  let userId: string
  let anotherUserToken: string
  let anotherUserId: string

  let readNotificationId: string
  let unreadNotificationId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    app.useGlobalInterceptors(new ResponseInterceptor())
    prisma = moduleFixture.get<PrismaService>(PrismaService)
    await app.init()

    // Setup User 1
    const userWallet1 = ethers.Wallet.createRandom()
    const ch1 = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: userWallet1.address })
    const sig1 = await userWallet1.signMessage(ch1.body.message)
    const login1 = await request(app.getHttpServer()).post('/auth/login').send({
      address: userWallet1.address,
      nonce: ch1.body.nonce,
      signature: sig1,
    })
    userToken = login1.body.accessToken
    const me1 = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
    userId = me1.body.id

    // Setup User 2
    const userWallet2 = ethers.Wallet.createRandom()
    const ch2 = await request(app.getHttpServer())
      .post('/auth/challenge')
      .send({ address: userWallet2.address })
    const sig2 = await userWallet2.signMessage(ch2.body.message)
    const login2 = await request(app.getHttpServer()).post('/auth/login').send({
      address: userWallet2.address,
      nonce: ch2.body.nonce,
      signature: sig2,
    })
    anotherUserToken = login2.body.accessToken
    const me2 = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${anotherUserToken}`)
    anotherUserId = me2.body.id
  })

  beforeEach(async () => {
    // Create notifications for User 1
    const readNotif = await prisma.notifications.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type: 'system' as $Enums.notification_type,
        title: 'Read Notification',
        read: true,
      },
    })
    readNotificationId = readNotif.id

    const unreadNotif = await prisma.notifications.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type: 'task_update' as $Enums.notification_type,
        title: 'Unread Notification',
        read: false,
      },
    })
    unreadNotificationId = unreadNotif.id
  })

  afterEach(async () => {
    await prisma.notifications.deleteMany({ where: { user_id: userId } })
  })

  afterAll(async () => {
    await prisma.users.deleteMany({
      where: { id: { in: [userId, anotherUserId] } },
    })
    await app.close()
  })

  describe('GET /notifications', () => {
    it('should return all notifications for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.items).toBeInstanceOf(Array)
      expect(response.body.total).toBe(2)
    })

    it('should return only read notifications when ?read=true', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ read: true })
        .expect(200)

      expect(response.body.total).toBe(1)
      expect(response.body.items[0].id).toBe(readNotificationId)
      expect(response.body.items[0].read).toBe(true)
    })

    it('should return only unread notifications when ?read=false', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ read: false })
        .expect(200)

      expect(response.body.total).toBe(1)
      expect(response.body.items[0].id).toBe(unreadNotificationId)
      expect(response.body.items[0].read).toBe(false)
    })
  })

  describe('POST /notifications/:id/read', () => {
    it('should mark an unread notification as read', async () => {
      const response = await request(app.getHttpServer())
        .post(`/notifications/${unreadNotificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201)

      expect(response.body.read).toBe(true)

      // Verify it's now in the read list
      const verify = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ read: true })

      expect(verify.body.total).toBe(2)
    })

    it('should return 404 for a non-existent notification', async () => {
      await request(app.getHttpServer())
        .post(`/notifications/${randomUUID()}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404)
    })

    it("should return 403 when trying to read another user's notification", async () => {
      await request(app.getHttpServer())
        .post(`/notifications/${unreadNotificationId}/read`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403)
    })
  })
})
