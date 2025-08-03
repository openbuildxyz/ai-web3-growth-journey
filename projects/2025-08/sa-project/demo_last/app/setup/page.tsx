'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Settings, 
  Search, 
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Building2,
  MessageCircle,
  Filter
} from 'lucide-react'
import Link from 'next/link'

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // 基础信息
    name: '',
    contact: '',
    position: '',
    salary: '',
    file: null as File | null,
    
    // Agent设置
    communicationStyle: '正式专业',
    responseSpeed: '即时回复',
    language: '中文',
    detailLevel: '适中详细',
    priorities: [] as string[],
    
    // 需求筛选
    searchKeyword: '',
    location: '',
    salaryRange: '',
    filters: [] as string[]
  })
  const [showResults, setShowResults] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'recruiter' | null>(null)

  // 从localStorage或URL参数获取角色信息
  useEffect(() => {
    const role = localStorage.getItem('selectedRole') as 'jobseeker' | 'recruiter' | null
    if (role) {
      setSelectedRole(role)
    }
    
    // 检查URL参数中的step
    const urlParams = new URLSearchParams(window.location.search)
    const stepParam = urlParams.get('step')
    if (stepParam) {
      setCurrentStep(parseInt(stepParam))
    }
  }, [])

  const steps = [
    {
      id: 1,
      title: '基础信息',
      description: '填写基本信息和上传文件',
      icon: Upload
    },
    {
      id: 2,
      title: 'Agent设置',
      description: '设置AI助手偏好和策略',
      icon: Settings
    },
    {
      id: 3,
      title: '需求筛选',
      description: '根据需求筛选匹配项',
      icon: Search
    }
  ]

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">基本信息</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">姓名/公司名称</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="请输入姓名或公司名称" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">联系方式</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              placeholder="请输入联系方式" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">期望职位/招聘职位</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="请输入职位信息" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">期望薪资/薪资范围</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              placeholder="例如：15k-25k" 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">文件上传</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">拖拽简历或公司介绍文件到此处，或点击选择文件</p>
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
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">沟通风格设置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">沟通风格</label>
            <select 
              className="input-field"
              value={formData.communicationStyle}
              onChange={(e) => setFormData({...formData, communicationStyle: e.target.value})}
            >
              <option>正式专业</option>
              <option>友好亲切</option>
              <option>简洁直接</option>
              <option>详细全面</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">回复速度</label>
            <select 
              className="input-field"
              value={formData.responseSpeed}
              onChange={(e) => setFormData({...formData, responseSpeed: e.target.value})}
            >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">优先考虑因素</label>
            <div className="space-y-2">
              {[
                '薪资待遇',
                '工作地点',
                '公司规模',
                '发展前景',
                '工作环境',
                '技能匹配',
                '学历要求',
                '工作经验'
              ].map((item) => (
                <label key={item} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={formData.priorities.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData, 
                          priorities: [...formData.priorities, item]
                        })
                      } else {
                        setFormData({
                          ...formData, 
                          priorities: formData.priorities.filter(p => p !== item)
                        })
                      }
                    }}
                  />
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
            <select 
              className="input-field"
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
            >
              <option>中文</option>
              <option>英文</option>
              <option>中英文混合</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">详细程度</label>
            <select 
              className="input-field"
              value={formData.detailLevel}
              onChange={(e) => setFormData({...formData, detailLevel: e.target.value})}
            >
              <option>简洁明了</option>
              <option>适中详细</option>
              <option>非常详细</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">搜索条件</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索关键词</label>
                         <input 
               type="text" 
               className="input-field" 
               value={formData.searchKeyword}
               onChange={(e) => setFormData({...formData, searchKeyword: e.target.value})}
               placeholder={selectedRole === 'recruiter' 
                 ? "例如：前端开发工程师、React开发工程师" 
                 : "例如：前端开发工程师、React开发工程师"}
             />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地点</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="例如：北京、上海" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">薪资范围</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.salaryRange}
                onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
                placeholder="例如：15k-25k" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">筛选条件</label>
                         <div className="flex flex-wrap gap-2">
               {(selectedRole === 'recruiter' 
                 ? [
                     '远程工作',
                     '五险一金',
                     '年终奖',
                     '带薪休假',
                     '培训机会',
                     '3年以上经验',
                     '本科及以上',
                     '技术栈匹配',
                     '沟通能力强',
                     '团队协作',
                     '有管理经验',
                     '英语流利'
                   ]
                 : [
                     '远程工作',
                     '五险一金',
                     '年终奖',
                     '带薪休假',
                     '培训机会',
                     '3年以上经验',
                     '本科及以上',
                     '技术栈匹配',
                     '沟通能力强',
                     '团队协作'
                   ]
               ).map((tag) => (
                <span 
                  key={tag} 
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    formData.filters.includes(tag)
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    if (formData.filters.includes(tag)) {
                      setFormData({
                        ...formData, 
                        filters: formData.filters.filter(f => f !== tag)
                      })
                    } else {
                      setFormData({
                        ...formData, 
                        filters: [...formData.filters, tag]
                      })
                    }
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* 筛选按钮 */}
          <div className="pt-4">
            <button 
              onClick={() => setShowResults(true)}
              className="btn-primary w-full md:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              开始筛选匹配
            </button>
          </div>
        </div>
      </div>

      {/* 只在点击筛选后显示结果 */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">匹配结果预览</h3>
            <button 
              onClick={() => setShowResults(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              隐藏结果
            </button>
          </div>
                     <div className="space-y-4">
             {[1, 2, 3].map((item) => (
               <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between">
                   <div>
                     <h4 className="font-semibold text-gray-900">
                       {selectedRole === 'recruiter' 
                         ? (item === 1 ? '张三 - 前端开发工程师' : 
                            item === 2 ? '李四 - React开发工程师' : 
                            '王五 - 全栈开发工程师')
                         : (item === 1 ? '前端开发工程师 - 字节跳动' : 
                            item === 2 ? 'React开发工程师 - 腾讯' : 
                            '全栈开发工程师 - 阿里巴巴')
                       }
                     </h4>
                     <p className="text-sm text-gray-600 mt-1">
                       {selectedRole === 'recruiter'
                         ? (item === 1 ? '北京 · 5年经验 · React/Vue/Node.js' : 
                            item === 2 ? '深圳 · 3年经验 · React/TypeScript' : 
                            '杭州 · 4年经验 · React/Node.js/Python')
                         : (item === 1 ? '北京 · 25k-35k · 3-5年经验' : 
                            item === 2 ? '深圳 · 20k-30k · 2-4年经验' : 
                            '杭州 · 30k-45k · 4-6年经验')
                       }
                     </p>
                     <p className="text-sm text-gray-500 mt-1">
                       匹配度：{item === 1 ? '95%' : item === 2 ? '88%' : '82%'}
                     </p>
                   </div>
                                     <Link href={`/detail/${item}`}>
                    <button className="btn-secondary">
                      查看详情
                    </button>
                  </Link>
                 </div>
               </div>
             ))}
           </div>
        </motion.div>
      )}
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return renderStep1()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.contact && formData.position
      case 2:
        return formData.priorities.length > 0
      case 3:
        return true // 第三步不需要强制要求搜索关键词
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">前期设置</h1>
                  <p className="text-sm text-gray-500">完成设置以获得最佳匹配效果</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一步
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <Link href="/dashboard">
              <button className="btn-primary">
                完成设置
                <Check className="w-4 h-4 ml-2" />
              </button>
            </Link>
          )}
        </div>
      </main>
    </div>
  )
} 