import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Container({ 
  children, 
  className, 
  as: Component = 'div',
  ...props 
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
} 