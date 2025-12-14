import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';

interface NotebookProps {
  isOpen?: boolean; // Optional now, mostly for sidebar mode
  onClose?: () => void; // Optional
  variant?: 'sidebar' | 'full';
}

const Notebook: React.FC<NotebookProps> = ({ isOpen = true, onClose, variant = 'sidebar' }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('soulingo_notebook_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soulingo_notebook_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      text: newNoteText,
      timestamp: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only process text files
    if (file.type && file.type !== 'text/plain') {
      alert('Lütfen sadece .txt uzantılı metin dosyaları yükleyin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const newNote: Note = {
          id: Date.now().toString(),
          text: `📄 ${file.name}\n\n${text}`, // Add filename as header
          timestamp: new Date().toISOString(),
        };
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
    };
    reader.onerror = () => {
      alert('Dosya okunurken bir hata oluştu.');
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render logic for different variants
  const isSidebar = variant === 'sidebar';
  
  const containerClasses = isSidebar
    ? `fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
    : `w-full h-full bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col`;

  return (
    <>
      {/* Overlay only for Sidebar mode */}
      {isSidebar && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Container */}
      <div className={containerClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center shadow-md ${!isSidebar ? 'rounded-t-2xl' : ''}`}>
            <h2 className="text-xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              NotebookLM
            </h2>
            {isSidebar && (
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Note Input */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Yeni bir not al... (Örn: 'Ambiguous: Belirsiz')"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24 text-sm"
            />
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="flex-grow bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Not Ekle
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
              />
              
              <button
                onClick={triggerFileInput}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium text-sm flex items-center justify-center"
                title=".txt Dosyası Yükle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-100">
            {notes.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p>Henüz hiç notun yok.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 group relative hover:shadow-md transition-shadow">
                  <p className="text-gray-800 whitespace-pre-wrap text-sm">{note.text}</p>
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{formatDate(note.timestamp)}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notebook;
