import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import { Note } from '../types';
import { CategorySelector } from './CategorySelector';

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isOnChain'>) => void;
  loading: boolean;
}

export const NoteForm: React.FC<NoteFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'meeting' | 'creative' | 'headline' | 'research'>('meeting');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tagArray,
    });

    // Reset form
    setTitle('');
    setContent('');
    setTags('');
    setCategory('meeting');
  };

  const handleAIGenerate = () => {
    setIsUploading(true);
    // 模拟AI生成
    setTimeout(() => {
      const aiContent = `基于您选择的${category === 'meeting' ? '会议记录' : category === 'creative' ? '创意笔记' : category === 'headline' ? '头脑风暴' : '调研笔记'}类型，AI为您生成了结构化的内容模板。您可以在此基础上进行编辑和完善。

主要内容：
1. 核心观点和重要信息
2. 关键决策和行动项
3. 后续跟进事项
4. 相关资源和参考链接

这个模板帮助您快速组织思路，提高记录效率。`;

      setContent(aiContent);
      setIsUploading(false);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">笔记上传</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 步骤1：上传手机图片 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 上传手机图片</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">点击或拖拽图片到这里上传</p>
              <p className="text-sm text-gray-500">支持 jpg、png 格式</p>
              <button
                type="button"
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                选择图片
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {selectedFile && (
                <div className="mt-2 text-green-600">已选择图片: {selectedFile.name}</div>
              )}
            </div>
          </div>

          {/* 步骤2：选择笔记类型 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 选择笔记类型</h3>
            <CategorySelector
              selectedCategory={category}
              onCategoryChange={(cat) => setCategory(cat as any)}
            />
          </div>

          {/* 步骤3：数字笔记资产化 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 数字笔记资产化</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  笔记标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入笔记标题"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="例如：产品,设计,会议"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-amber-800">上传至区块链</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    将您的笔记永久保存在区块链上，实现数字资产化
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 步骤4：AI智能生成 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">4. AI 智能生成</h3>
            <button
              type="submit"
              
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '开始生成中...' : '开始生成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};