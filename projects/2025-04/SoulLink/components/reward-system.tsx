"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Coins, Heart, Trophy, Gift, TrendingUp } from "lucide-react"

interface RewardSystemProps {
  account: string
}

export default function RewardSystem({ account }: RewardSystemProps) {
  const [userStats, setUserStats] = useState({
    totalLikes: 0,
    totalEarnings: 0,
    nftsMinted: 0,
    level: 1,
    experience: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    // 模拟加载用户数据
    loadUserStats()
    loadRecentActivities()
  }, [account])

  const loadUserStats = () => {
    // 模拟用户统计数据
    setUserStats({
      totalLikes: Math.floor(Math.random() * 1000),
      totalEarnings: Math.random() * 0.5,
      nftsMinted: Math.floor(Math.random() * 10),
      level: Math.floor(Math.random() * 5) + 1,
      experience: Math.floor(Math.random() * 100),
    })
  }

  const loadRecentActivities = () => {
    // 模拟最近活动
    const activities = [
      {
        type: "like",
        description: "您的NFT获得了5个点赞",
        reward: "0.001 ETH",
        timestamp: Date.now() - 3600000,
      },
      {
        type: "mint",
        description: "成功铸造新NFT",
        reward: "10 XP",
        timestamp: Date.now() - 7200000,
      },
      {
        type: "achievement",
        description: '达成"创作者"成就',
        reward: "0.005 ETH",
        timestamp: Date.now() - 86400000,
      },
    ]
    setRecentActivities(activities)
  }

  const claimRewards = async () => {
    // 模拟领取奖励
    console.log("领取奖励...")
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "mint":
        return <Coins className="w-4 h-4 text-yellow-500" />
      case "achievement":
        return <Trophy className="w-4 h-4 text-purple-500" />
      default:
        return <Gift className="w-4 h-4 text-blue-500" />
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return "刚刚"
    if (hours < 24) return `${hours}小时前`
    return `${Math.floor(hours / 24)}天前`
  }

  return (
    <div className="space-y-6">
      {/* 用户统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.totalLikes}</p>
                <p className="text-sm text-gray-600">总点赞数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.totalEarnings.toFixed(3)}</p>
                <p className="text-sm text-gray-600">总收益 (ETH)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.nftsMinted}</p>
                <p className="text-sm text-gray-600">已铸造NFT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">Lv.{userStats.level}</p>
                <p className="text-sm text-gray-600">用户等级</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 等级进度 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            等级进度
          </CardTitle>
          <CardDescription>通过创建NFT、获得点赞和参与社区活动来提升等级</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">等级 {userStats.level}</span>
            <span className="text-sm text-gray-500">{userStats.experience}/100 XP</span>
          </div>
          <Progress value={userStats.experience} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>当前等级</span>
            <span>下一等级</span>
          </div>
        </CardContent>
      </Card>

      {/* 奖励机制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" />
            奖励机制
          </CardTitle>
          <CardDescription>通过各种活动获得奖励和收益</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">点赞奖励</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">每获得10个点赞可获得0.001 ETH奖励</p>
              <Badge variant="secondary">自动发放</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">创作奖励</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">每铸造一个NFT获得经验值和创作者徽章</p>
              <Badge variant="secondary">即时获得</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                <span className="font-medium">成就奖励</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">完成特定成就可获得额外ETH奖励</p>
              <Badge variant="secondary">里程碑奖励</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-medium">交易分成</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">NFT二次交易时获得5%的版税收入</p>
              <Badge variant="secondary">持续收益</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>查看您最近的奖励和活动记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  +{activity.reward}
                </Badge>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4" onClick={claimRewards}>
            <Gift className="w-4 h-4 mr-2" />
            领取待领奖励
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
