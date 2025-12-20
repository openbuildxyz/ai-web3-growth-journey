import React from 'react';
import { X, Calendar, Tag, ExternalLink, Award, Edit3, Trash2 } from 'lucide-react';
import { Note } from '../types';

interface NoteDetailProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUploadToBlockchain: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  canUpload: boolean;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ 
  note, 
  isOpen, 
  onClose, 
  onUploadToBlockchain,
  onDelete,
  canUpload 
}) => {
  if (!isOpen || !note) return null;

  const categoryNames = {
    meeting: '会议记录',
    creative: '创意笔记',
    headline: '头脑风暴',
    research: '调研笔记',
  };

  const categoryColors = {
    meeting: 'bg-blue-100 text-blue-800',
    creative: 'bg-purple-100 text-purple-800',
    headline: 'bg-green-100 text-green-800',
    research: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">{note.title}</h2>
            {note.isOnChain && (
              <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                <Award className="h-4 w-4" />
                <span>已认证</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit3 className="h-5 w-5 text-gray-500" />
            </button>
            <button 
              onClick={() => {
                if (confirm('确定要删除这条笔记吗？')) {
                  onDelete(note.id);
                  onClose();
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 元信息 */}
          <div className="flex items-center space-x-6 mb-6 pb-4 border-b border-gray-100">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[note.category]}`}>
              {categoryNames[note.category]}
            </span>
            
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <Calendar className="h-4 w-4" />
              <span>创建于 {note.createdAt.toLocaleDateString()}</span>
            </div>

            {note.tags.length > 0 && (
              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                <Tag className="h-4 w-4" />
                <span>{note.tags.join(', ')}</span>
              </div>
            )}
          </div>

          {/* 内容 */}
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {note.content}
            </div>
          </div>

          {/* 区块链信息 */}
          {note.isOnChain ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">区块链资产信息</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Token ID:</span>
                  <span className="font-mono text-green-800">#{note.tokenId}</span>
                </div>
                {note.transactionHash && (
                  <div className="flex justify-between">
                    <span className="text-green-700">交易哈希:</span>
                    <a 
                      href={`https://etherscan.io/tx/${note.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-mono underline"
                    >
                      {note.transactionHash.slice(0, 10)}...{note.transactionHash.slice(-8)}
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-green-700">状态:</span>
                  <span className="text-green-800 font-medium">已认证</span>
                </div>
              </div>
            </div>
          ) : (
            canUpload && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-1">上链资产-密钥</h4>
                    <p className="text-sm text-purple-700">
                      将此笔记铸造为NFT，实现永久保存和数字资产化
                    </p>
                  </div>
                  <button
                    onClick={() => onUploadToBlockchain(note.id)}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>生成 NFT</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};