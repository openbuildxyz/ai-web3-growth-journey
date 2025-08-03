import React from 'react';
import { Users, Lightbulb, Megaphone, BookOpen } from 'lucide-react';
import { CategoryInfo } from '../types';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  const categories: CategoryInfo[] = [
    {
      id: 'meeting',
      name: '会议记录',
      icon: 'users',
      description: '记录会议要点和决策',
      color: 'text-blue-600',
    },
    {
      id: 'creative',
      name: '创意笔记',
      icon: 'lightbulb',
      description: '捕捉灵感和创意想法',
      color: 'text-purple-600',
    },
    {
      id: 'headline',
      name: '头脑风暴',
      icon: 'megaphone',
      description: '集体思考和方案讨论',
      color: 'text-green-600',
    },
    {
      id: 'research',
      name: '调研笔记',
      icon: 'book-open',
      description: '研究资料和分析总结',
      color: 'text-orange-600',
    },
  ];

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'users': return <Users className={className} />;
      case 'lightbulb': return <Lightbulb className={className} />;
      case 'megaphone': return <Megaphone className={className} />;
      case 'book-open': return <BookOpen className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`p-6 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-md ${
            selectedCategory === category.id
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex justify-center mb-3">
            {getIcon(category.icon, `h-8 w-8 ${category.color}`)}
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
          <p className="text-sm text-gray-600">{category.description}</p>
        </button>
      ))}
    </div>
  );
};