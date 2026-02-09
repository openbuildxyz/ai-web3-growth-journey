import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsModule } from '../../src/Modules/Notifications/notifications.module'

describe('NotificationsModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [NotificationsModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
