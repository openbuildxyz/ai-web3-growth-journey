import React from 'react';
import { Leaf } from 'lucide-react';
import { CustomConnectButton } from './CustomConnectButton';

export const Header = () => {
  return (
    <header className="w-full bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground animate-leaf-float" />
          </div>
          <span className="text-xl font-poppins font-bold text-foreground">
            绿踪 <span className="text-primary">GreenTrace</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-muted-foreground hover:text-primary transition-smooth">
            项目介绍
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-smooth">
            工作原理
          </a>
          <a href="#partners" className="text-muted-foreground hover:text-primary transition-smooth">
            生态伙伴
          </a>
        </nav>

        {/* Connect Wallet Button */}
        <CustomConnectButton />
      </div>
    </header>
  );
};