import React from 'react';
import { Calendar, Tag, ExternalLink, Award } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onUploadToBlockchain: (noteId: string) => void;
  canUpload: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onClick, 
  onUploadToBlockchain, 
  canUpload 
}) => {
  const categoryColors = {
    meeting: 'bg-blue-100 text-blue-800',
    creative: 'bg-purple-100 text-purple-800', 
    headline: 'bg-green-100 text-green-800',
    research: 'bg-orange-100 text-orange-800',
  };

  const categoryNames = {
    meeting: '会议记录',
    creative: '创意笔记',
    headline: '头脑风暴', 
    research: '调研笔记',
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {note.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {note.content}
          </p>
        </div>
        
        {note.isOnChain && (
          <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
            <Award className="h-3 w-3" />
            <span>已认证</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[note.category]}`}>
            {categoryNames[note.category]}
          </span>
          
          <div className="flex items-center space-x-1 text-gray-500 text-xs">
            <Calendar className="h-3 w-3" />
            <span>{note.createdAt.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {note.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {note.tags.slice(0, 2).join(', ')}
                {note.tags.length > 2 && '...'}
              </span>
            </div>
          )}

          {!note.isOnChain && canUpload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUploadToBlockchain(note.id);
              }}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-xs bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-full transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>上链</span>
            </button>
          )}

          {note.isOnChain && note.tokenId && (
            <div className="text-xs text-gray-500">
              Token ID: #{note.tokenId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};