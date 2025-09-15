import React, { useState, useMemo } from 'react';
import { FileText, Layers, Filter } from 'lucide-react';
import { Note } from '../types';
import { NoteCard } from './NoteCard';

interface NotesPageProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onUploadToBlockchain: (noteId: string) => void;
  onNewNote: () => void;
  canUpload: boolean;
}

export const NotesPage: React.FC<NotesPageProps> = ({ 
  notes, 
  onNoteClick, 
  onUploadToBlockchain, 
  onNewNote,
  canUpload 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const categories = [
    { id: 'all', name: '全部笔记', count: notes.length },
    { id: 'meeting', name: '会议记录', count: notes.filter(n => n.category === 'meeting').length },
    { id: 'creative', name: '创意笔记', count: notes.filter(n => n.category === 'creative').length },
    { id: 'headline', name: '头脑风暴', count: notes.filter(n => n.category === 'headline').length },
    { id: 'research', name: '调研笔记', count: notes.filter(n => n.category === 'research').length },
  ];

  const filteredNotes = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? notes 
      : notes.filter(note => note.category === selectedCategory);

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [notes, selectedCategory, sortBy]);

  const onChainNotes = notes.filter(note => note.isOnChain);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">原始笔记数据</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">共 {notes.length} 个文件</p>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={onNewNote}
                className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                新建笔记
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">上链资产-密钥</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">共 {onChainNotes.length} 个 NFT</p>

              <div className="space-y-3">
                {onChainNotes.slice(0, 3).map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{note.title}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">已认证</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Token ID: #{note.tokenId}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                管理文件
              </button>
            </div>
          </div>

          {/* 主内容 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">整理内容</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="date">按时间排序</option>
                        <option value="title">按标题排序</option>
                      </select>
                    </div>
                    <span className="text-sm text-gray-500">共 {filteredNotes.length} 个文件</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">没有找到符合条件的笔记</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => onNoteClick(note)}
                        onUploadToBlockchain={onUploadToBlockchain}
                        canUpload={canUpload}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};