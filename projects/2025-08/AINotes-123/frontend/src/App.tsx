import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeatureSection } from './components/FeatureSection';
import { RecentNotes } from './components/RecentNotes';
import { TemplateSection } from './components/TemplateSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { NotesPage } from './components/NotesPage';
import { NoteForm } from './components/NoteForm';
import { NoteDetail } from './components/NoteDetail';
import MetaMaskConnector from './components/MetaMaskConnector';
import { useNotes } from './hooks/useNotes';
import { useWallet } from './hooks/useWallet';
import { uploadToIPFS } from './utils/uploadToIPFS'
import { Note } from './types';

type ViewMode = 'home' | 'notes';



function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNoteDetailOpen, setIsNoteDetailOpen] = useState(false);

  const { notes, loading, addNote, deleteNote, uploadToBlockchain } = useNotes();
  const { walletState, mintNoteAsNFT } = useWallet();

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmitNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isOnChain'>) => {
    try {
      await addNote(noteData);
      setIsNoteFormOpen(false);
      setViewMode('notes');
    } catch (error) {
      console.error('Error submitting note:', error);
      alert('提交笔记失败，请重试');
    }
  };

  const handleUploadToBlockchain = async (noteId: string) => {
    if (!walletState.isConnected) {
      alert('请先连接钱包');
      return;
    }

    try {
      // 找到当前笔记
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        alert('未找到笔记');
        return;
      }

      // 假设 note.file 是 File 类型（你需要确保 Note 结构有图片 file 字段）
      let ipfsUrl = note.imageUrl; // 如果已经有 IPFS 地址则直接用
      if (note.file && note.file instanceof File) {
        ipfsUrl = await uploadToIPFS(note.file);
      }

      // 传递 ipfsUrl 给区块链 mint 函数
      const result = await uploadToBlockchain(noteId, mintNoteAsNFT, ipfsUrl);
      alert(`成功将笔记上链！Token ID: ${result.tokenId}`);
    } catch (error) {
      console.error('Error uploading to blockchain:', error);
      alert('上链失败，请重试');
    }
  };


  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsNoteDetailOpen(true);
  };

  const handleGetStarted = () => {
    setIsNoteFormOpen(true);
  };

  const handleNewNote = () => {
    setIsNoteFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={handleNewNote}
      />
      {/* 钱包连接组件 */}
      <MetaMaskConnector />

      {viewMode === 'home' ? (
        <>
          <Hero onGetStarted={handleGetStarted} />
          <FeatureSection onUploadClick={handleGetStarted} />
          <RecentNotes
            notes={filteredNotes}
            onNoteClick={handleNoteClick}
            onUploadToBlockchain={handleUploadToBlockchain}
            canUpload={walletState.isConnected}
          />
          <TemplateSection />
          <CTASection onGetStarted={handleGetStarted} />
          <Footer />
        </>
      ) : (
        <NotesPage
          notes={filteredNotes}
          onNoteClick={handleNoteClick}
          onUploadToBlockchain={handleUploadToBlockchain}
          onNewNote={handleNewNote}
          canUpload={walletState.isConnected}
        />
      )}

      <NoteForm
        isOpen={isNoteFormOpen}
        onClose={() => setIsNoteFormOpen(false)}
        onSubmit={handleSubmitNote}
        loading={loading}
      />

      <NoteDetail
        note={selectedNote}
        isOpen={isNoteDetailOpen}
        onClose={() => {
          setIsNoteDetailOpen(false);
          setSelectedNote(null);
        }}
        onUploadToBlockchain={handleUploadToBlockchain}
        onDelete={deleteNote}
        canUpload={walletState.isConnected}
      />

      {/* 导航按钮 */}
      <div className="fixed bottom-6 right-6 flex space-x-3">
        <button
          onClick={() => setViewMode('home')}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${viewMode === 'home'
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
        >
          首页
        </button>
        <button
          onClick={() => setViewMode('notes')}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${viewMode === 'notes'
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
        >
          笔记 ({notes.length})
        </button>
      </div>
    </div>
  );
}

export default App;