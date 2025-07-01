import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { Container } from '@/components/ui/container';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const links = [
    {
      title: "手册",
      items: [
        { text: "开始指南", href: "/docs/introduction" },
        { text: "规划阶段", href: "/docs/planning" },
        { text: "构建阶段", href: "/docs/building" },
        { text: "验证阶段", href: "/docs/validation" },
        { text: "发布阶段", href: "/docs/launching" },
      ]
    },
    {
      title: "资源",
      items: [
        { text: "案例研究", href: "/docs/case-studies" },
        { text: "实操教程", href: "/docs/case-studies/practical-tutorials" },
        { text: "资源库", href: "/docs/resources" },
        { text: "贡献指南", href: "/docs/contribute" },
      ]
    },
    {
      title: "社区",
      items: [
        { text: "GitHub", href: "https://github.com/openbuildxyz" },
        { text: "官网", href: "https://openbuildxyz.com" },
        { text: "微信公众号", href: "#" },
        { text: "社群", href: "#" },
      ]
    },
  ];

  return (
    <footer className="w-full py-12 bg-gray-50 dark:bg-gray-950">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} AI³ Growth Journey by OpenBuild & 周周黑客松
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Link 
              href="https://openbuild.xyz" 
              target="_blank"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              OpenBuild
            </Link>
            <Link 
              href="https://hackathonweekly.com/" 
              target="_blank" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              周周黑客松
            </Link>
            <Link 
              href="mailto:ian@openbuild.xyz" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              联系我们
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
} 