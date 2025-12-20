import React from 'react';
import { Leaf, Twitter, MessageCircle, Send } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-poppins font-bold text-foreground">
                绿踪 <span className="text-primary">GreenTrace</span>
              </span>
            </div>
            <p className="text-muted-foreground font-inter mb-6 max-w-md">
              通过区块链技术激励全球环保行为，共同建设可持续的绿色未来。每一次环保行为都有价值。
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-semibold text-foreground mb-4">快速链接</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">项目介绍</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">工作原理</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">代币经济</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">合作伙伴</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-poppins font-semibold text-foreground mb-4">资源</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">白皮书</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">帮助中心</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">开发者API</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">联系我们</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 GreenTrace. 保留所有权利。
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-smooth">隐私政策</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-smooth">服务条款</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-smooth">Cookie政策</a>
          </div>
        </div>
      </div>
    </footer>
  );
};