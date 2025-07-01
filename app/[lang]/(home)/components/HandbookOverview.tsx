'use client';
import Link from 'next/link';
import { BookOpen, CheckCircle, Sparkles, Target, Zap, Code2, Users, Calendar, Award, Rocket, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';

export function HandbookOverview() {
  const features = [
    {
      icon: Target,
      title: "由亚太顶级社区联合发起",
      description: "OpenBuild (亚太最大的Web3开源社区) 与 周周黑客松 (中国最具活力的AI产品创造者社区) 联合发起"
    },
    {
      icon: Zap,
      title: "横跨亚太的开发者活动",
      description: "每月举办线上AI+Web3 Workshop和线下Mini-Hackathon，覆盖中国、泰国、越南、马来西亚、新加坡、印度等地区"
    },
    {
      icon: Code2,
      title: "AI+Web3融合创新",
      description: "探索AI Smart Contract、Web3 AI Agent、OnChain Data Insight、AIGC Gaming等前沿主题"
    },
    {
      icon: Users,
      title: "多元参与机会",
      description: "面向开发者、共建者和赞助商开放，提供黑客松奖金、孵化器对接和投资机会"
    },
    {
      icon: Calendar,
      title: "10个月的持续计划",
      description: "从3月开始，未来10个月持续开展，每月解锁一个颠覆性命题"
    },
    {
      icon: Award,
      title: "丰厚奖励与独家资源",
      description: "限量版「赛博功德」NFT勋章、周周黑客松 X OpenBuild 独家周边、与顶级VC共进深夜泡面局"
    }
  ];

  const benefitFeatures = [
    {
      id: "skills",
      title: "掌握前沿技术",
      description: "通过实战项目快速掌握AI+Web3的前沿技术栈和开发经验"
    },
    {
      id: "network",
      title: "扩展人脉资源",
      description: "与15,000+开发者和顶级投资人建立连接，获取优质项目孵化机会"
    },
    {
      id: "opportunity",
      title: "发现创新机会",
      description: "在AI与Web3碰撞的前沿探索下一个独角兽项目的诞生"
    },
    {
      id: "community",
      title: "加入开发者社区",
      description: "成为活跃的开发者社区一员，共同推动技术发展与创新应用落地"
    }
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="w-full py-20 pt-8 px-4 bg-white dark:bg-black relative overflow-hidden">
      {/* Background design elements - simplified */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large blurred gradient circles - positioned to match with HeroSection */}
        <div className="absolute -top-60 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-purple-100 to-indigo-200 dark:from-purple-900 dark:to-indigo-800 rounded-full opacity-50 transform translate-x-1/2 blur-xl" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gradient-to-br from-indigo-100 via-blue-50 to-transparent dark:from-indigo-950 dark:via-blue-900 dark:to-transparent rounded-full opacity-50 transform -translate-x-1/2 blur-xl" />
        
        {/* Key horizontal and vertical lines */}
        <div className="absolute top-0 right-0 w-1/3 h-[2px] bg-gradient-to-l from-transparent via-indigo-300 dark:via-indigo-600 to-transparent opacity-70" />
        <div className="absolute bottom-0 left-0 w-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-600 to-transparent opacity-70" />
        
        {/* Strategic larger shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 border-4 border-indigo-200 dark:border-indigo-700 transform rotate-45 opacity-60" />
        <div className="absolute bottom-1/4 right-1/3 w-32 h-32 border-8 border-amber-200 dark:border-amber-700 rounded-full opacity-30" />
        
        {/* Key accent circles - positioned to match with HeroSection */}
        <div className="absolute top-10 right-12 w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-600 rounded-full opacity-60 shadow-lg" />
        
        {/* Limited colorful dots - just one group */}
        <div className="absolute top-40 right-12 grid grid-cols-3 gap-4 opacity-60">
          <div className="w-4 h-4 rounded-full bg-indigo-300 dark:bg-indigo-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-blue-300 dark:bg-blue-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-cyan-300 dark:bg-cyan-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-teal-300 dark:bg-teal-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-green-300 dark:bg-green-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-emerald-300 dark:bg-emerald-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-purple-300 dark:bg-purple-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-violet-300 dark:bg-violet-600 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-fuchsia-300 dark:bg-fuchsia-600 shadow-md" />
        </div>
      </div>
      
      <Container className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-2 mb-4">
            <BookOpen className="h-6 w-6 text-black dark:text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">AI³ Growth Journey 介绍</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            一场横跨亚太的<strong>AI+Web3开发者觉醒运动</strong>，通过实战<strong>探索前沿技术</strong>并构建创新应用
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Card className="h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">活动特色</h3>
                <ul className="space-y-6">
                  {features.map((feature) => (
                    <motion.li key={feature.title} variants={item} className="flex items-start">
                      <div className="mr-3 flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{feature.title}</p>
                        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Card className="h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-start mb-6">
                  <Rocket className="h-6 w-6 text-gray-800 dark:text-gray-200 mr-3 flex-shrink-0 mt-1" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">参与收获</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  AI³ Growth Journey将帮助你在AI+Web3融合创新的浪潮中占据先机，获取独特优势
                </p>
                
                <ul className="space-y-6">
                  {benefitFeatures.map((feature) => (
                    <motion.li key={feature.id} variants={item} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-gray-800 dark:text-gray-200 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{feature.title}</p>
                        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link 
            href="/docs" 
            className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium inline-flex items-center border-b-2 border-gray-200 dark:border-gray-700 pb-1 transition-all hover:border-black dark:hover:border-white"
          >
            查看活动详情 <span className="ml-1">→</span>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}