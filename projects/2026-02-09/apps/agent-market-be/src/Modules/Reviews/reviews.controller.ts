import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { CreateReviewDto, ListAgentReviewsQueryDto } from './dto/review.dto'
import { ReviewsService } from './reviews.service'

// 业务模块：评价接口。
@ApiTags('reviews')
@ApiBearerAuth()
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('tasks/:id/review')
  @ApiOperation({ summary: '提交评价' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201 })
  create(
    @Param('id') taskId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto,
  ) {
    // 实现步骤：
    // 1. 校验任务状态与权限。
    // 2. 创建评价并更新声誉。
    return this.reviewsService.createReview(taskId, user, dto)
  }

  @Get('agents/:id/reviews')
  @ApiOperation({ summary: 'Agent 评价列表' })
  @ApiResponse({ status: 200 })
  list(@Param('id') agentId: string, @Query() query: ListAgentReviewsQueryDto) {
    // 实现步骤：
    // 1. 读取 Agent ID。
    // 2. 返回评价列表。
    return this.reviewsService.listAgentReviews(agentId, query)
  }
}
