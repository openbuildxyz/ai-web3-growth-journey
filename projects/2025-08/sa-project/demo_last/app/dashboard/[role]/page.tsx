'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Settings, 
  Search, 
  MessageCircle, 
  User, 
  Building2, 
  ArrowLeft,
  FileText,
  Briefcase,
  Filter,
  Send
} from 'lucide-react'
import Link from 'next/link'

interface DashboardProps {
  params: {
    role: string
  }
}

export default function DashboardPage({ params }: DashboardProps) {
  const { role } = params
  const [activeTab, setActiveTab] = useState('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [isAgentSetting, setIsAgentSetting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isChatting, setIsChatting] = useState(false)

  const isJobseeker = role === 'jobseeker'
  const roleTitle = isJobseeker ? '求职者' : '招聘者'

  const tabs = [
    {
      id: 'upload',
      title: '上传信息',
      description: '填写基本信息并上传文件',
      icon: Upload,
      color: 'bg-blue-500'
    },
    {
      id: 'agent',
      title: '设置Agent',
      description: '设置AI助手偏好和策略',
      icon: Settings,
      color: 'bg-green-500'
    },
    {
      id: 'search',
      title: '需求筛选',
      description: '根据需求筛选匹配项',
      icon: Search,
      color: 'bg-purple-500'
    },
    {
      id: 'chat',
      title: '对话',
      description: '与对方Agent进行对话',
      icon: MessageCircle,
      color: 'bg-orange-500'
    }
  ]

  const renderUploadSection = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">基本信息</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isJobseeker ? '姓名' : '公司名称'}
            </label>
            <input type="text" className="input-field" placeholder={isJobseeker ? '请输入您的姓名' : '请输入公司名称'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isJobseeker ? '联系方式' : '联系电话'}
            </label>
            <input type="text" className="input-field" placeholder="请输入联系方式" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isJobseeker ? '期望职位' : '招聘职位'}
            </label>
            <input type="text" className="input-field" placeholder={isJobseeker ? '请输入期望职位' : '请输入招聘职位'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isJobseeker ? '期望薪资' : '薪资范围'}
            </label>
            <input type="text" className="input-field" placeholder={isJobseeker ? '请输入期望薪资' : '请输入薪资范围'} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">文件上传</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {isJobseeker ? '拖拽简历文件到此处，或点击选择文件' : '拖拽公司介绍文件到此处，或点击选择文件'}
          </p>
          <p className="text-sm text-gray-500">支持 PDF, DOC, DOCX 格式，最大 10MB</p>
          <button className="btn-primary mt-4">
            选择文件
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">区块链信息</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">信息将上传到区块链以确保可追溯性</p>
              <p className="text-xs text-gray-500 mt-1">交易哈希将在上传后显示</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <button 
        className="btn-primary w-full"
        onClick={() => setIsUploading(true)}
        disabled={isUploading}
      >
        {isUploading ? '上传中...' : '提交信息'}
      </button>
    </div>
  )

  const renderAgentSection = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">沟通风格设置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">沟通风格</label>
            <select className="input-field">
              <option>正式专业</option>
              <option>友好亲切</option>
              <option>简洁直接</option>
              <option>详细全面</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">回复速度</label>
            <select className="input-field">
              <option>即时回复</option>
              <option>快速回复（5分钟内）</option>
              <option>正常回复（30分钟内）</option>
              <option>延迟回复（1小时内）</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">匹配策略</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isJobseeker ? '优先考虑因素' : '筛选标准'}
            </label>
            <div className="space-y-2">
              {isJobseeker ? [
                '薪资待遇',
                '工作地点',
                '公司规模',
                '发展前景',
                '工作环境'
              ] : [
                '工作经验',
                '技能匹配',
                '学历要求',
                '年龄范围',
                '期望薪资'
              ].map((item, index) => (
                <label key={index} className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">AI助手偏好</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语言偏好</label>
            <select className="input-field">
              <option>中文</option>
              <option>英文</option>
              <option>中英文混合</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">详细程度</label>
            <select className="input-field">
              <option>简洁明了</option>
              <option>适中详细</option>
              <option>非常详细</option>
            </select>
          </div>
        </div>
      </div>

      <button 
        className="btn-primary w-full"
        onClick={() => setIsAgentSetting(true)}
        disabled={isAgentSetting}
      >
        {isAgentSetting ? '保存中...' : '保存设置'}
      </button>
    </div>
  )

  const renderSearchSection = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">搜索条件</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isJobseeker ? '搜索职位' : '搜索候选人'}
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder={isJobseeker ? '例如：前端开发工程师' : '例如：React开发工程师'}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地点</label>
              <input type="text" className="input-field" placeholder="例如：北京、上海" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isJobseeker ? '薪资范围' : '预算范围'}
              </label>
              <input type="text" className="input-field" placeholder="例如：15k-25k" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">筛选条件</label>
            <div className="flex flex-wrap gap-2">
              {isJobseeker ? [
                '远程工作',
                '五险一金',
                '年终奖',
                '带薪休假',
                '培训机会'
              ] : [
                '3年以上经验',
                '本科及以上',
                '技术栈匹配',
                '沟通能力强',
                '团队协作'
              ].map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button 
          className="btn-primary w-full mt-4"
          onClick={() => setIsSearching(true)}
          disabled={isSearching}
        >
          {isSearching ? '搜索中...' : '开始搜索'}
        </button>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">匹配结果</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {isJobseeker ? `前端开发工程师 - 字节跳动` : `张三 - 前端开发工程师`}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {isJobseeker ? '北京 · 25k-35k · 3-5年经验' : '5年经验 · React/Vue · 本科'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    匹配度：95%
                  </p>
                </div>
                <button className="btn-secondary">
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderChatSection = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">联系人列表</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                {isJobseeker ? <Building2 className="w-5 h-5 text-primary-600" /> : <User className="w-5 h-5 text-primary-600" />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {isJobseeker ? `字节跳动HR` : `张三 - 前端工程师`}
                </h4>
                <p className="text-sm text-gray-500">
                  {isJobseeker ? '前端开发工程师职位' : '5年React开发经验'}
                </p>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                <p className="text-xs text-gray-500">在线</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">对话窗口</h3>
        <div className="border border-gray-200 rounded-lg h-96 flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h5 className="font-medium">
              {isJobseeker ? '与字节跳动HR的对话' : '与张三的对话'}
            </h5>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs">
                <p className="text-sm">您好！请问您对我们公司的职位感兴趣吗？</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary-600 text-white rounded-lg px-3 py-2 max-w-xs">
                <p className="text-sm">是的，我对前端开发工程师这个职位很感兴趣</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs">
                <p className="text-sm">太好了！请问您有React开发经验吗？</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input 
                type="text" 
                className="flex-1 input-field" 
                placeholder="输入消息..."
              />
              <button className="btn-primary">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return renderUploadSection()
      case 'agent':
        return renderAgentSection()
      case 'search':
        return renderSearchSection()
      case 'chat':
        return renderChatSection()
      default:
        return renderUploadSection()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  {isJobseeker ? <User className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{roleTitle}工作台</h1>
                  <p className="text-sm text-gray-500">AI智能匹配平台</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`card text-center transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'ring-2 ring-primary-500 bg-primary-50' 
                    : 'hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-12 h-12 ${tab.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <tab.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{tab.title}</h3>
                <p className="text-xs text-gray-600">{tab.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
} 