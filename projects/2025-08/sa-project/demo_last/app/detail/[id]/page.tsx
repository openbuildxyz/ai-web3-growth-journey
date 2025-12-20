'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  MessageCircle,
  User,
  Building2,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  Briefcase,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  Hash
} from 'lucide-react'
import Link from 'next/link'

interface DetailData {
  id: string
  name: string
  role: 'jobseeker' | 'recruiter'
  title: string
  location: string
  experience: string
  salary: string
  education: string
  skills: string[]
  description: string
  contact: {
    phone: string
    email: string
    linkedin?: string
  }
  blockchainInfo: {
    hash: string
    timestamp: string
    verified: boolean
  }
  documents: {
    name: string
    type: string
    size: string
    uploadedAt: string
  }[]
}

export default function DetailPage({ params }: { params: { id: string } }) {
  const [detailData, setDetailData] = useState<DetailData | null>(null)
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'recruiter' | null>(null)


  useEffect(() => {
    // 从localStorage获取角色信息
    const role = localStorage.getItem('selectedRole') as 'jobseeker' | 'recruiter' | null
    setSelectedRole(role)

    // 模拟获取详情数据
    const mockData: DetailData = {
      id: params.id,
      name: params.id === '1' ? '张三' : params.id === '2' ? '李四' : '王五',
      role: 'jobseeker',
      title: params.id === '1' ? '前端开发工程师' : params.id === '2' ? 'React开发工程师' : '全栈开发工程师',
      location: params.id === '1' ? '北京' : params.id === '2' ? '深圳' : '杭州',
      experience: params.id === '1' ? '5年' : params.id === '2' ? '3年' : '4年',
      salary: params.id === '1' ? '25k-35k' : params.id === '2' ? '20k-30k' : '30k-45k',
      education: '本科',
      skills: params.id === '1' 
        ? ['React', 'Vue.js', 'Node.js', 'TypeScript', 'Webpack']
        : params.id === '2'
        ? ['React', 'TypeScript', 'Redux', 'Jest', 'Git']
        : ['React', 'Node.js', 'Python', 'Docker', 'AWS'],
      description: '具有丰富的Web开发经验，熟悉现代前端技术栈，有良好的代码规范和团队协作能力。参与过多个大型项目的开发，对性能优化和用户体验有深入理解。',
      contact: {
        phone: '138****1234',
        email: 'example@email.com',
        linkedin: 'linkedin.com/in/example'
      },
      blockchainInfo: {
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: '2024-01-15 14:30:25',
        verified: true
      },
      documents: [
        {
          name: '个人简历.pdf',
          type: 'PDF',
          size: '2.5MB',
          uploadedAt: '2024-01-15 14:30:25'
        },
        {
          name: '作品集.pdf',
          type: 'PDF',
          size: '5.2MB',
          uploadedAt: '2024-01-15 14:30:25'
        }
      ]
    }
    setDetailData(mockData)
  }, [params.id])

  if (!detailData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/setup" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  {detailData.role === 'jobseeker' ? <User className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">详细信息</h1>
                  <p className="text-sm text-gray-500">区块链验证信息</p>
                </div>
              </div>
            </div>
            
            <Link href={`/chat/${params.id}`}>
              <button className="btn-primary flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>开始对话</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：基本信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 个人信息卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{detailData.name}</h2>
                    <p className="text-lg text-gray-600">{detailData.title}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{detailData.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{detailData.experience}经验</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{detailData.salary}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600">已验证</span>
                </div>
              </div>

              {/* 技能标签 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">技能专长</h3>
                <div className="flex flex-wrap gap-2">
                  {detailData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* 个人描述 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">个人介绍</h3>
                <p className="text-gray-600 leading-relaxed">{detailData.description}</p>
              </div>
            </motion.div>

            {/* 区块链信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">区块链验证信息</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">交易哈希</p>
                      <p className="text-xs text-gray-500 font-mono">{detailData.blockchainInfo.hash}</p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">上传时间</p>
                      <p className="text-xs text-gray-500">{detailData.blockchainInfo.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">验证状态</p>
                      <p className="text-xs text-green-600">已验证</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 上传文档 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">上传文档</h3>
              <div className="space-y-3">
                {detailData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      查看
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 右侧：联系信息和快速操作 */}
          <div className="space-y-6">
            {/* 联系信息 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">联系信息</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{detailData.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{detailData.contact.email}</span>
                </div>
                {detailData.contact.linkedin && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{detailData.contact.linkedin}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 教育背景 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">教育背景</h3>
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{detailData.education}</span>
              </div>
            </motion.div>

            {/* 快速操作 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="space-y-3">
                <Link href={`/chat/${params.id}`}>
                  <button className="w-full btn-primary">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    开始对话
                  </button>
                </Link>
                <button className="w-full btn-secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  下载简历
                </button>
                <button className="w-full btn-secondary">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  查看作品集
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>


    </div>
  )
} 