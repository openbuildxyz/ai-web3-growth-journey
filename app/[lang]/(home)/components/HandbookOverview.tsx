'use client';
import Link from 'next/link';
import { BookOpen, CheckCircle, Sparkles, Target, Zap, Code2, Users, Calendar, Award, Rocket, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function HandbookOverview() {
  const t = useTranslations('HandbookOverview');

  const features = [
    {
      icon: Target,
      title: t('features.community'),
      description: t('features.communityDesc')
    },
    {
      icon: Zap,
      title: t('features.activities'),
      description: t('features.activitiesDesc')
    },
    {
      icon: Code2,
      title: t('features.innovation'),
      description: t('features.innovationDesc')
    },
    {
      icon: Users,
      title: t('features.participation'),
      description: t('features.participationDesc')
    },
    {
      icon: Calendar,
      title: t('features.duration'),
      description: t('features.durationDesc')
    },
    {
      icon: Award,
      title: t('features.rewards'),
      description: t('features.rewardsDesc')
    }
  ];

  const benefitFeatures = [
    {
      id: "skills",
      title: t('benefits.skills'),
      description: t('benefits.skillsDesc')
    },
    {
      id: "network",
      title: t('benefits.network'),
      description: t('benefits.networkDesc')
    },
    {
      id: "opportunity",
      title: t('benefits.opportunity'),
      description: t('benefits.opportunityDesc')
    },
    {
      id: "community",
      title: t('benefits.community'),
      description: t('benefits.communityDesc')
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
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
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('featuresTitle')}</h3>
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('benefitsTitle')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('benefitsDescription')}
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
            {t('viewDetails')} <span className="ml-1">→</span>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}