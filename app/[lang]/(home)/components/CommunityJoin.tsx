'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function CommunityJoin() {
  return (
    <section className="w-full py-16 px-4 bg-white dark:bg-black relative overflow-hidden">
      {/* Background design elements - simplified */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main large blurred circle */}
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-50 via-indigo-100 to-transparent dark:from-blue-950 dark:via-indigo-900 dark:to-transparent rounded-full opacity-40 transform -translate-x-1/2 -translate-y-1/2 blur-xl" />

        {/* Accent blurred circle */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-amber-50 via-orange-100 to-transparent dark:from-amber-950 dark:via-orange-900 dark:to-transparent rounded-full opacity-40 transform translate-x-1/3 translate-y-1/3 blur-xl" />

        {/* Horizontal line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent opacity-70" />

        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-[300px] h-[3px] bg-gradient-to-l from-transparent to-purple-300 dark:to-purple-700 opacity-50 transform -rotate-45 origin-top-right" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[3px] bg-gradient-to-r from-transparent to-purple-300 dark:to-purple-700 opacity-50 transform -rotate-45 origin-bottom-left" />
        </div>

        {/* Accent shapes */}
        <div className="absolute top-1/4 left-1/4 w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 rounded-full opacity-50 transform rotate-45" />
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 opacity-40 transform rotate-12" />
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            加入AI³ Growth Journey开发者社区
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            与15,000+开发者共同探索AI+Web3前沿技术，参与亚太最具活力的开发者活动，
            你的项目将穿越20万+开发者网络，直达顶级孵化器与投资人的雷达
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white shadow-lg px-8">
              <Link href="https://hackathonweekly.feishu.cn/share/base/form/shrcnBjdytUgit8dDtRbPCPoaac">
                开发者报名 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="border-2 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-8">
              <Link href="https://hackathonweekly.feishu.cn/share/base/form/shrcnQzgHo1teYRjmDTUbdpxoWk">
                成为共建者 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
