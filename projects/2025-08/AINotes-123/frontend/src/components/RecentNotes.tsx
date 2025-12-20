import React from 'react';
import { Note } from '../types';
import { NoteCard } from './NoteCard';

interface RecentNotesProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onUploadToBlockchain: (noteId: string) => void;
  canUpload: boolean;
}

export const RecentNotes: React.FC<RecentNotesProps> = ({ 
  notes, 
  onNoteClick, 
  onUploadToBlockchain, 
  canUpload 
}) => {
  const recentNotes = notes.slice(0, 6);

  if (recentNotes.length === 0) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">最近的笔记</h2>
          <div className="bg-gray-50 rounded-2xl p-12">
            <p className="text-gray-600 text-lg">还没有笔记，开始创建您的第一份智能笔记吧！</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">最近的笔记</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => onNoteClick(note)}
              onUploadToBlockchain={onUploadToBlockchain}
              canUpload={canUpload}
            />
          ))}
        </div>
      </div>
    </section>
  );
};