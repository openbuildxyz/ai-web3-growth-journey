import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { ReputationModule } from '../Reputation/reputation.module'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'

// 业务模块：评价与评分提交。
@Module({
  imports: [PrismaModule, ReputationModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
