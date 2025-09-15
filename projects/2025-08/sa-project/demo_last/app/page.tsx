'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Building2, 
  MessageCircle, 
  Settings, 
  Upload, 
  Search,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'recruiter' | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [shouldRedirectToSetup, setShouldRedirectToSetup] = useState(false)

  // 处理重定向到主界面
  useEffect(() => {
    if (shouldRedirectToSetup && selectedRole) {
      window.location.href = '/dashboard'
    }
  }, [shouldRedirectToSetup, selectedRole])

  const roles = [
    {
      id: 'jobseeker',
      title: '求职者',
      description: '寻找理想工作机会',
      icon: User,
      color: 'bg-blue-500',
      features: [
        '上传简历和个人信息',
        '设置求职偏好',
        '智能匹配工作机会',
        '与招聘方AI助手对话'
      ]
    },
    {
      id: 'recruiter',
      title: '招聘者',
      description: '寻找优秀人才',
      icon: Building2,
      color: 'bg-green-500',
      features: [
        '发布职位信息',
        '设置招聘要求',
        '智能筛选候选人',
        '与求职者AI助手对话'
      ]
    }
  ]

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">个人信息</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedRole === 'jobseeker' ? '姓名' : '公司名称'}
            </label>
            <input type="text" className="input-field" placeholder={selectedRole === 'jobseeker' ? '请输入您的姓名' : '请输入公司名称'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedRole === 'jobseeker' ? '联系方式' : '联系电话'}
            </label>
            <input type="text" className="input-field" placeholder="请输入联系方式" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedRole === 'jobseeker' ? '期望职位' : '招聘职位'}
            </label>
            <input type="text" className="input-field" placeholder={selectedRole === 'jobseeker' ? '请输入期望职位' : '请输入招聘职位'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedRole === 'jobseeker' ? '期望薪资' : '薪资范围'}
            </label>
            <input type="text" className="input-field" placeholder={selectedRole === 'jobseeker' ? '请输入期望薪资' : '请输入薪资范围'} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">文件上传</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {selectedRole === 'jobseeker' ? '拖拽简历文件到此处，或点击选择文件' : '拖拽公司介绍文件到此处，或点击选择文件'}
          </p>
          <p className="text-sm text-gray-500">支持 PDF, DOC, DOCX 格式，最大 10MB</p>
          <button className="btn-primary mt-4">
            选择文件
          </button>
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
                {selectedRole === 'jobseeker' ? <Building2 className="w-5 h-5 text-primary-600" /> : <User className="w-5 h-5 text-primary-600" />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {selectedRole === 'jobseeker' ? `字节跳动HR` : `张三 - 前端工程师`}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedRole === 'jobseeker' ? '前端开发工程师职位' : '5年React开发经验'}
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
              {selectedRole === 'jobseeker' ? '与字节跳动HR的对话' : '与张三的对话'}
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
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSection()
      case 'chat':
        return renderChatSection()
      default:
        return renderProfileSection()
    }
  }

  // 如果还没有选择角色，显示角色选择页面
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">AI求职平台</h1>
              </div>
              <div className="text-sm text-gray-500">
                智能匹配 · 精准推荐
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              欢迎使用AI求职平台
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8"
            >
              基于AI技术的智能匹配系统，为求职者和招聘者提供精准服务
            </motion.p>
          </div>

          {/* Role Selection */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">
              请选择您的角色
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="card cursor-pointer transition-all duration-300 hover:shadow-lg"
                  onClick={() => {
                    setSelectedRole(role.id as 'jobseeker' | 'recruiter')
                    localStorage.setItem('selectedRole', role.id)
                    setShouldRedirectToSetup(true)
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center mr-4`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{role.title}</h4>
                      <p className="text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Overview */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-12">
              平台功能特色
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: '智能匹配',
                  description: '基于AI算法精准匹配求职者与职位',
                  icon: User
                },
                {
                  title: '信息上传',
                  description: '安全上传简历和公司信息到区块链',
                  icon: Upload
                },
                {
                  title: 'AI助手',
                  description: '智能Agent协助沟通和筛选',
                  icon: Settings
                },
                {
                  title: '即时对话',
                  description: '实时与对方AI助手进行对话',
                  icon: MessageCircle
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 如果已选择角色，显示主界面
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  {selectedRole === 'jobseeker' ? <User className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {selectedRole === 'jobseeker' ? '求职者' : '招聘者'}工作台
                  </h1>
                  <p className="text-sm text-gray-500">AI智能匹配平台</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>个人信息</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>对话</span>
              </button>
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>切换角色</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-600 hover:text-gray-900"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('profile')
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>个人信息</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('chat')
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'chat' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>对话</span>
                </button>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span>切换角色</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Progress */}
        <div className="mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">前期设置进度</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">1</span>
                </div>
                <span className="text-sm text-gray-600">基础信息</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">2</span>
                </div>
                <span className="text-sm text-gray-500">Agent设置</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">3</span>
                </div>
                <span className="text-sm text-gray-500">需求筛选</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/setup">
                <button className="btn-primary">
                  继续设置
                </button>
              </Link>
            </div>
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