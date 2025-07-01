'use client';
import { Lightbulb, Search, HelpCircle, Users, Code, Palette, Building, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';

export function TargetAudienceAndFAQ() {
  const audiences = [
    {
      icon: Code,
      name: "开发者",
      description: "有编程基础或AI/Web3爱好的技术人员，希望探索AI+Web3的融合创新",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: PenTool,
      name: "共建者",
      description: "技术布道者、项目炼金师、活动造浪者等希望共同推动AI+Web3发展的贡献者",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Building,
      name: "赞助商",
      description: "关注AI+Web3创新领域，希望接触高质量开发者和项目的机构和企业",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const faqs = [
    {
      question: "活动都在哪些城市举办？",
      answer: "活动覆盖亚太主要城市，包括曼谷、胡志明、吉隆坡、新加坡、北上广深杭等。线上Workshop不受地域限制，随时参与。"
    },
    {
      question: "需要哪些技术背景才能参加？",
      answer: "适合有编程基础、AIGC能力、产品设计、运营经验，或者Web3/AI爱好者。不同主题对技术背景要求不同，我们会提前告知。"
    },
    {
      question: "参加活动能获得什么？",
      answer: "黑客松奖金、孵化器对接、投资机会、限量NFT勋章、独家周边，以及与顶级VC共进深夜泡面局的机会。"
    },
    {
      question: "如何成为赞助商？",
      answer: "赞助费用8,000美元起，可获得全年品牌曝光、定制主题黑客松、提前锁定优质开发者等权益。联系ian@openbuild.xyz了解详情。"
    }
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="w-full py-20 px-4 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Background design elements - simplified */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main large blurred circle */}
        <div className="absolute -left-40 top-1/4 w-[450px] h-[450px] bg-gradient-to-br from-purple-50 via-indigo-100 to-transparent dark:from-purple-950 dark:via-indigo-900 dark:to-transparent rounded-full opacity-40 transform blur-xl" />
        
        {/* Core cross lines */}
        <div className="absolute top-0 left-1/3 right-1/3 h-[2px] bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-1/3 right-1/3 h-[2px] bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent opacity-60" />
        
        {/* Primary diagonal line */}
        <div className="absolute top-0 right-0 w-[300px] h-[3px] bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-700 opacity-50 transform -rotate-45 origin-top-right" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[3px] bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-700 opacity-50 transform -rotate-45 origin-bottom-left" />
        
        {/* Minimal geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border-4 border-indigo-200 dark:border-indigo-700 rounded-full opacity-40" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 opacity-30 transform rotate-12" />
        
        {/* Small circle accents */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-gradient-to-br from-teal-200 to-teal-300 dark:from-teal-700 dark:to-teal-600 rounded-full opacity-60 shadow-md" />
        <div className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-gradient-to-br from-rose-200 to-rose-300 dark:from-rose-700 dark:to-rose-600 rounded-full opacity-60 shadow-md" />
      </div>
      
      <Container className="relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-20"
        >
          {/* Target Audience Section */}
          <div>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 p-2 mb-4">
                <Users className="h-6 w-6 text-gray-900 dark:text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">参与对象</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                招募<strong>开发者</strong>、<strong>共建者</strong>和<strong>赞助商</strong>，共同探索AI+Web3的未来
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {audiences.map((audience, index) => (
                <motion.div key={audience.name} variants={itemVariants}>
                  <Card className="h-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 mb-4 mx-auto">
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{index + 1}</span>
                      </div>
                      <h3 className="font-semibold text-lg text-center text-gray-900 dark:text-white mb-2">{audience.name}</h3>
                      <p className="text-sm text-center text-gray-600 dark:text-gray-400">{audience.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* FAQ Section */}
          <div>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 p-2 mb-4">
                <HelpCircle className="h-6 w-6 text-gray-800 dark:text-gray-200" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">常见问题</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                关于创建MVP及获取用户的常见疑问解答
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {faqs.map((faq) => (
                <motion.div key={faq.question} variants={itemVariants}>
                  <Card className="h-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">{faq.question}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
} 