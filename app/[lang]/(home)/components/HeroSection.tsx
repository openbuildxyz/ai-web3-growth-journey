import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function HeroSection() {
  return (
    <section className="w-full py-24 pb-16 lg:py-32 lg:pb-24 px-4 bg-white dark:bg-black relative overflow-hidden">
      {/* Geometric background elements - simplified */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main large blurred circles */}
        <div className="absolute -top-40 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900 dark:to-cyan-800 rounded-full opacity-50 transform -translate-x-1/2 blur-xl" />
        <div className="absolute bottom-[-200px] right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-purple-100 to-indigo-200 dark:from-purple-900 dark:to-indigo-800 rounded-full opacity-50 transform translate-x-1/2 blur-xl" />

        {/* Key accent circles */}
        <div className="absolute top-1/4 right-10 w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-600 rounded-full opacity-60 shadow-lg" />
        <div className="absolute bottom-1/4 left-10 w-12 h-12 bg-gradient-to-br from-emerald-200 to-green-300 dark:from-emerald-700 dark:to-green-600 rounded-full opacity-60 shadow-lg" />

        {/* Primary square */}
        <div className="absolute top-1/3 right-0 w-60 h-60 border-4 border-indigo-200 dark:border-indigo-800 rounded-md opacity-40 transform rotate-12" />

        {/* Main diagonal lines */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[3px] bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent opacity-70 transform -rotate-45" />

        {/* Horizontal lines */}
        <div className="absolute top-1/4 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent opacity-50" />
        <div className="absolute bottom-1/4 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent opacity-50" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col items-center max-w-4xl mx-auto">
          <div className="text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-indigo-600 dark:text-indigo-400"
                aria-labelledby="triangleIconTitle"
                role="img"
              >
                <title id="triangleIconTitle">AI+Web3 Growth Journey</title>
                <path
                  d="M24 4L44 40H4L24 4Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 22L34 38H14L24 22Z"
                  fill="white"
                  stroke="none"
                />
              </svg>
              <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                AI+Web3开发者成长计划
              </h2>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              <span className="text-black dark:text-white bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-cyan-800 px-2 rounded">AI³</span> Growth <span className="text-black dark:text-white bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-800 px-2 rounded">Journey</span><br />
              <span className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 dark:from-gray-300 dark:via-gray-200 dark:to-white bg-clip-text text-transparent">AI+Web3开发者成长计划</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
              OpenBuild与周周黑客松联合发起亚太区AI+Web3开发者成长计划，每月举办<strong>线上Workshop</strong>和<strong>线下Mini-Hackathon</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Button asChild size="lg" variant="outline" className="border-2 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 shadow-lg">
              <Link href="https://hackathonweekly.feishu.cn/share/base/form/shrcnBjdytUgit8dDtRbPCPoaac" className="font-semibold px-8 py-6 text-lg">
                开发者报名 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="border-2 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 shadow-lg">
              <Link href="https://hackathonweekly.feishu.cn/share/base/form/shrcnQzgHo1teYRjmDTUbdpxoWk"  className="font-semibold px-8 py-6 text-lg">
                成为共建者 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white dark:from-indigo-500 dark:to-blue-600 dark:hover:from-indigo-600 dark:hover:to-blue-700 shadow-lg">
              <Link href="/docs" className="font-semibold px-8 py-6 text-lg">
                开始探索 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

         {/*<div className="mt-16 grid grid-cols-3 gap-3 max-w-lg mx-auto">*/}
         {/*   <div className="aspect-square bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-cyan-800 rounded-lg shadow-md flex items-center justify-center">*/}
         {/*     <span className="text-3xl font-bold">AI</span>*/}
         {/*   </div>*/}
         {/*   <div className="aspect-square bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-800 rounded-lg shadow-md flex items-center justify-center">*/}
         {/*     <span className="text-3xl font-bold">+</span>*/}
         {/*   </div>*/}
         {/*   <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-800 rounded-lg shadow-md flex items-center justify-center">*/}
         {/*     <span className="text-3xl font-bold">Web3</span>*/}
         {/*   </div>*/}
         {/* </div>*/}
        </div>
      </Container>
    </section>
  );
}
