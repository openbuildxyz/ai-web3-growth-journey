import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Leaf } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}

const StatCard = ({ icon, value, label, suffix = '', color }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = value / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 30);
      
      return () => clearInterval(interval);
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Card className="p-8 text-center transition-smooth hover:shadow-glow border-border/50">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="text-4xl font-poppins font-bold text-foreground mb-2 animate-counting">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground font-inter">{label}</div>
    </Card>
  );
};

export const StatsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-poppins font-bold text-foreground mb-4">
            全球绿色影响力
          </h2>
          <p className="text-xl text-muted-foreground">
            实时数据展示我们共同创造的环保成果
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <StatCard
            icon={<Leaf className="w-8 h-8 text-primary-foreground" />}
            value={1247}
            label="已减少的碳排放 (吨)"
            color="bg-gradient-primary"
          />
          
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-gold-foreground" />}
            value={2850000}
            label="已分发的 GTC 总量"
            color="bg-gradient-gold"
          />
          
          <StatCard
            icon={<Users className="w-8 h-8 text-accent-foreground" />}
            value={12487}
            label="全球参与用户数"
            color="bg-accent"
          />
        </div>
      </div>
    </section>
  );
};