import React, { useState, useRef, useEffect } from 'react';
import { ImageFile, ImageAnalysisContent, MessageSender, Message, MessageType, TextContent, AppMode } from './types';
import { geminiService } from './services/geminiService';
import { fileToBase64 } from './utils/base64Utils';
import { ENGLISH_MESSAGE_REGEX, SOULINGO_INTRODUCTION } from './constants';
import ChatInput from './components/ChatInput';
import MessageDisplay from './components/MessageDisplay';
import Notebook from './components/Notebook';
import LandingPage from './components/LandingPage';

function Soulingo() {
  const [currentMode, setCurrentMode] = useState<AppMode>('landing');
  
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: 'welcome',
      sender: MessageSender.Soulingo,
      timestamp: new Date(),
      type: MessageType.Text,
      content: { text: SOULINGO_INTRODUCTION },
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll logic depends on mode
  useEffect(() => {
    if (currentMode === 'chat' || currentMode === 'vision') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, currentMode]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    // Switch to vision mode if not already (though input usually only available there)
    if (currentMode !== 'vision') setCurrentMode('vision');

    try {
      const base64 = await fileToBase64(file);
      const imageFile: ImageFile = {
        base64,
        mimeType: file.type,
        fileName: file.name,
      };

      const soulingoResponse: ImageAnalysisContent = await geminiService.analyzeImage(imageFile);

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai-img-analysis',
        sender: MessageSender.Soulingo,
        timestamp: new Date(),
        type: MessageType.ImageAnalysis,
        content: soulingoResponse,
      };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Image analysis failed:", err);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        sender: MessageSender.Soulingo,
        timestamp: new Date(),
        type: MessageType.Text,
        content: { text: (err as Error).message || 'Resim analizi sırasında bir hata oluştu.' },
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    const newUserMessage: Message = {
      id: Date.now().toString() + '-user-text',
      sender: MessageSender.User,
      timestamp: new Date(),
      type: MessageType.Text,
      content: { text },
    };
    setChatHistory((prev) => [...prev, newUserMessage]);

    try {
      let soulingoTextResponse: string;
      let responseType: MessageType = MessageType.Text;

      if (ENGLISH_MESSAGE_REGEX.test(text)) {
        soulingoTextResponse = await geminiService.checkGrammar(text);
        responseType = MessageType.GrammarCorrection;
      } else {
        soulingoTextResponse = await geminiService.chat(chatHistory, text);
      }

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai-text',
        sender: MessageSender.Soulingo,
        timestamp: new Date(),
        type: responseType,
        content: { text: soulingoTextResponse },
      };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Text interaction failed:", err);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        sender: MessageSender.Soulingo,
        timestamp: new Date(),
        type: MessageType.Text,
        content: { text: (err as Error).message || 'Mesajınızı işlerken bir hata oluştu.' },
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (currentMode === 'landing') {
    return <LandingPage onSelectMode={(mode) => setCurrentMode(mode)} />;
  }

  // --- Main Application Layout (Sidebar + Content) ---

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col items-center md:items-stretch z-30 transition-all duration-300">
        <div className="p-4 flex items-center justify-center md:justify-start h-20 border-b border-gray-100 cursor-pointer" onClick={() => setCurrentMode('landing')}>
           {/* Logo Icon */}
           <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
             S
           </div>
           <span className="ml-3 font-bold text-xl text-gray-800 hidden md:block">Soulingo</span>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          
          {/* Vision Tab Button */}
          <button 
            onClick={() => setCurrentMode('vision')}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${currentMode === 'vision' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
             <svg className={`w-6 h-6 flex-shrink-0 ${currentMode === 'vision' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             <span className="ml-3 font-medium hidden md:block">Görsel Zeka</span>
          </button>

          {/* Chat Tab Button */}
          <button 
            onClick={() => setCurrentMode('chat')}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${currentMode === 'chat' ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
             <svg className={`w-6 h-6 flex-shrink-0 ${currentMode === 'chat' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
             </svg>
             <span className="ml-3 font-medium hidden md:block">Akıllı Sohbet</span>
          </button>

          {/* Notebook Tab Button */}
          <button 
            onClick={() => setCurrentMode('notebook')}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${currentMode === 'notebook' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
             <svg className={`w-6 h-6 flex-shrink-0 ${currentMode === 'notebook' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             </svg>
             <span className="ml-3 font-medium hidden md:block">NotebookLM</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow h-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 relative">
        
        {/* VIEW: CHAT */}
        {currentMode === 'chat' && (
          <div className="flex flex-col h-full max-w-4xl mx-auto bg-white shadow-xl md:border-x border-gray-100">
             <div className="p-4 border-b border-gray-100 bg-white z-10">
               <h2 className="text-lg font-bold text-gray-800">Sohbet Geçmişi</h2>
             </div>
             <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {chatHistory.filter(m => m.type !== MessageType.ImageAnalysis).map((message) => (
                  <MessageDisplay key={message.id} message={message} />
                ))}
                {isLoading && <div className="text-center text-sm text-gray-500 animate-pulse">Soulingo yazıyor...</div>}
                <div ref={messagesEndRef} />
             </div>
             <div className="p-4 border-t border-gray-100 bg-white">
               <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
             </div>
          </div>
        )}

        {/* VIEW: VISION */}
        {currentMode === 'vision' && (
          <div className="flex flex-col h-full max-w-4xl mx-auto p-6 overflow-y-auto">
             <div className="flex-grow flex flex-col items-center">
                
                {/* Upload Area */}
                <div className="w-full bg-white rounded-3xl shadow-sm border-2 border-dashed border-blue-200 p-8 text-center hover:border-blue-400 transition-colors cursor-pointer mb-8" onClick={triggerFileInput}>
                   <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                   </div>
                   <h3 className="text-2xl font-bold text-gray-800 mb-2">Resim Yükle</h3>
                   <p className="text-gray-500">Analiz etmek için bir fotoğrafa tıkla veya buraya sürükle</p>
                   <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                </div>

                {/* Analysis Results Display */}
                <div className="w-full space-y-6">
                   {isLoading && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                        <svg className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600">Görüntü analiz ediliyor...</p>
                      </div>
                   )}
                   
                   {/* Show only Image Analysis messages here */}
                   {chatHistory.filter(m => m.type === MessageType.ImageAnalysis).reverse().map((message) => (
                      <div key={message.id} className="animate-fade-in-up">
                        <MessageDisplay message={message} />
                      </div>
                   ))}
                </div>
                <div ref={messagesEndRef} />
             </div>
          </div>
        )}

        {/* VIEW: NOTEBOOK */}
        {currentMode === 'notebook' && (
           <div className="h-full w-full p-4 md:p-8">
              <Notebook variant="full" />
           </div>
        )}

      </main>
    </div>
  );
}

export default Soulingo;
