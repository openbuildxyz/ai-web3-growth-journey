'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings,
  Search,
  MessageCircle,
  User,
  Building2,
  ArrowRight,
  Plus,
  Filter,
  Star,
  Clock,
  MapPin,
  Briefcase,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  role: 'jobseeker' | 'recruiter'
  title: string
  location: string
  experience: string
  salary: string
  matchRate: number
  lastActive: string
  avatar: string
  status: 'online' | 'offline'
}

export default function DashboardPage() {
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'recruiter' | null>(null)
  const [activeTab, setActiveTab] = useState<'setup' | 'filter' | 'chat'>('setup')
  const [setupProgress, setSetupProgress] = useState({
    basicInfo: false,
    agentSettings: false
  })
  const [filterResults, setFilterResults] = useState<UserData[]>([])
  const [chatUsers, setChatUsers] = useState<UserData[]>([])

  useEffect(() => {
    // 从localStorage获取角色信息
    const role = localStorage.getItem('selectedRole') as 'jobseeker' | 'recruiter' | null
    setSelectedRole(role)

    // 模拟数据
    const mockUsers: UserData[] = [
      {
        id: '1',
        name: '张三',
        role: 'jobseeker',
        title: '前端开发工程师',
        location: '北京',
        experience: '5年',
        salary: '25k-35k',
        matchRate: 95,
        lastActive: '2分钟前',
        avatar: '/api/placeholder/40/40',
        status: 'online'
      },
      {
        id: '2',
        name: '李四',
        role: 'jobseeker',
        title: 'React开发工程师',
        location: '深圳',
        experience: '3年',
        salary: '20k-30k',
        matchRate: 88,
        lastActive: '5分钟前',
        avatar: '/api/placeholder/40/40',
        status: 'online'
      },
      {
        id: '3',
        name: '王五',
        role: 'jobseeker',
        title: '全栈开发工程师',
        location: '杭州',
        experience: '4年',
        salary: '30k-45k',
        matchRate: 82,
        lastActive: '10分钟前',
        avatar: '/api/placeholder/40/40',
        status: 'offline'
      }
    ]

    setFilterResults(mockUsers)
    setChatUsers(mockUsers)
  }, [])

  const tabs = [
    {
      id: 'setup',
      title: '前期设置',
      description: '基础信息和Agent设置',
      icon: Settings,
      color: 'bg-blue-500'
    },
    {
      id: 'filter',
      title: '需求筛选',
      description: '根据需求筛选匹配项',
      icon: Search,
      color: 'bg-green-500'
    },
    {
      id: 'chat',
      title: '深入对话人物',
      description: '与匹配用户进行对话',
      icon: MessageCircle,
      color: 'bg-purple-500'
    }
  ]

  const renderSetupTab = () => (
    <div className="space-y-6">
      {/* 基础信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">基础信息</h3>
              <p className="text-sm text-gray-500">填写个人或公司基本信息</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {setupProgress.basicInfo ? (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">已完成</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">未完成</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          设置您的姓名、联系方式、期望职位等基本信息，帮助系统更好地为您匹配。
        </p>
        <Link href="/setup?step=1">
          <button className="btn-primary">
            {setupProgress.basicInfo ? '修改信息' : '开始设置'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </Link>
      </motion.div>

      {/* Agent设置卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Agent设置</h3>
              <p className="text-sm text-gray-500">配置AI助手偏好和策略</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {setupProgress.agentSettings ? (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">已完成</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">未完成</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          设置沟通风格、回复速度、语言偏好等，让AI助手更好地代表您进行对话。
        </p>
        <Link href="/setup?step=2">
          <button className="btn-primary">
            {setupProgress.agentSettings ? '修改设置' : '开始设置'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </Link>
      </motion.div>
    </div>
  )

  const renderFilterTab = () => (
    <div className="space-y-6">
      {/* 筛选条件卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
              <p className="text-sm text-gray-500">设置匹配条件</p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索关键词</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder={selectedRole === 'recruiter' 
                ? "例如：前端开发工程师、React开发工程师" 
                : "例如：前端开发工程师、React开发工程师"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">地点</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="例如：北京、上海"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">筛选条件</label>
          <div className="flex flex-wrap gap-2">
            {[
              '远程工作', '五险一金', '年终奖', '带薪休假', '培训机会',
              '3年以上经验', '本科及以上', '技术栈匹配', '沟通能力强', '团队协作'
            ].map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full">
          <Search className="w-4 h-4 mr-2" />
          开始筛选匹配
        </button>
      </motion.div>

      {/* 匹配结果 */}
      {filterResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">匹配结果</h3>
          <div className="space-y-4">
            {filterResults.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.title}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{user.experience}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{user.salary}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{user.matchRate}%</span>
                      </div>
                      <p className="text-xs text-gray-500">{user.lastActive}</p>
                    </div>
                    <Link href={`/detail/${user.id}`}>
                      <button className="btn-secondary">
                        查看详情
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

  const renderChatTab = () => (
    <div className="space-y-6">
      {/* 对话用户列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">对话用户</h3>
          <button className="btn-secondary">
            <Plus className="w-4 h-4 mr-2" />
            添加用户
          </button>
        </div>
        
        <div className="space-y-4">
          {chatUsers.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.title}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{user.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{user.matchRate}%</span>
                    </div>
                    <p className="text-xs text-gray-500">匹配度</p>
                  </div>
                  <Link href={`/chat/${user.id}`}>
                    <button className="btn-primary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      开始对话
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'setup':
        return renderSetupTab()
      case 'filter':
        return renderFilterTab()
      case 'chat':
        return renderChatTab()
      default:
        return renderSetupTab()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                {selectedRole === 'jobseeker' ? <User className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">主界面</h1>
                <p className="text-sm text-gray-500">
                  {selectedRole === 'jobseeker' ? '求职者' : '招聘者'} - 智能匹配平台
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentTab()}
        </motion.div>
      </main>
    </div>
  )
} 