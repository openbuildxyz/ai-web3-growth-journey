import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('web3-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(parsedNotes);
    } else {
      // 初始化一些示例笔记
      const initialNotes: Note[] = [
        {
          id: '1',
          title: '产品战略规划会议记录',
          content: '讨论了2024年产品路线图重点，涵盖了7个核心功能模块，预计市场需求呈上升趋势。',
          category: 'meeting',
          tags: ['产品', '战略'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          isOnChain: false,
        },
        {
          id: '2',
          title: '人工智能发展趋势调研笔记',
          content: '围绕了AI技术发展现状分析，对比国内外AI应用现状，计算智能发展创新路径。',
          category: 'research',
          tags: ['AI', '研究'],
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-01-14'),
          isOnChain: false,
        },
        {
          id: '3',
          title: '新产品创意头脑风暴',
          content: '团队集体讨论创新想法，结合市场需求分析和竞争对手调研，产生多个创新点。',
          category: 'creative',
          tags: ['创意', '产品'],
          createdAt: new Date('2024-01-13'),
          updatedAt: new Date('2024-01-13'),
          isOnChain: true,
          tokenId: '2024011502',
        },
      ];
      setNotes(initialNotes);
      localStorage.setItem('web3-notes', JSON.stringify(initialNotes));
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('web3-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isOnChain'>) => {
    setLoading(true);
    try {
      const newNote: Note = {
        ...noteData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnChain: false,
      };

      const updatedNotes = [...notes, newNote];
      saveNotes(updatedNotes);
      return newNote;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setLoading(true);
    try {
      const updatedNotes = notes.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      );
      saveNotes(updatedNotes);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  };

  const uploadToBlockchain = async (noteId: string, mintFunction: (id: string, metadata: any) => Promise<any>,ipfsUrl:string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) throw new Error('笔记不存在');

    setLoading(true);
    try {
      const metadata = {
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        timestamp: note.createdAt.toISOString(),
      };

      const result = await mintFunction(noteId, metadata);
      
      await updateNote(noteId, {
        isOnChain: true,
        tokenId: result.tokenId,
        transactionHash: result.transactionHash,
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    uploadToBlockchain,
  };
};