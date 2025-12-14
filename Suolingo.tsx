import React, { useState, useRef, useEffect } from 'react';
import { ImageFile, ImageAnalysisContent, MessageSender, Message, MessageType, TextContent } from './types';
import { geminiService } from './services/geminiService';
import { fileToBase64 } from './utils/base64Utils';
// Fix: Corrected import name from SUOLINGO_INTRODUCTION to SOULINGO_INTRODUCTION
import { ENGLISH_MESSAGE_REGEX, SOULINGO_INTRODUCTION } from './constants';
import ChatInput from './components/ChatInput';
import MessageDisplay from './components/MessageDisplay';

// Fix: Renamed component from Suolingo to Soulingo
function Soulingo() {
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: 'welcome',
      // Fix: Changed MessageSender.Suolingo to MessageSender.Soulingo
      sender: MessageSender.Soulingo,
      timestamp: new Date(),
      type: MessageType.Text,
      // Fix: Changed SUOLINGO_INTRODUCTION to SOULINGO_INTRODUCTION
      content: { text: SOULINGO_INTRODUCTION },
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to the latest message whenever chat history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const userImageMessage: Message = {
      id: Date.now().toString() + '-user-img',
      sender: MessageSender.User,
      timestamp: new Date(),
      type: MessageType.Text, // Displaying it as a text message for now, but could be extended to show image preview
      content: { text: `Resim yüklendi: ${file.name}` }, // Or embed a base64 preview
    };
    setChatHistory((prev) => [...prev, userImageMessage]);

    try {
      const base64 = await fileToBase64(file);
      const imageFile: ImageFile = {
        base64,
        mimeType: file.type,
        fileName: file.name,
      };

      // Fix: Renamed suolingoResponse to soulingoResponse for consistency
      const soulingoResponse: ImageAnalysisContent = await geminiService.analyzeImage(imageFile);

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai-img-analysis',
        // Fix: Changed MessageSender.Suolingo to MessageSender.Soulingo
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
        // Fix: Changed MessageSender.Suolingo to MessageSender.Soulingo
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
      // Fix: Renamed suolingoTextResponse to soulingoTextResponse for consistency
      let soulingoTextResponse: string;
      let responseType: MessageType = MessageType.Text;

      if (ENGLISH_MESSAGE_REGEX.test(text)) {
        // Assume English for grammar check
        soulingoTextResponse = await geminiService.checkGrammar(text);
        responseType = MessageType.GrammarCorrection;
      } else {
        // Assume Turkish or general chat
        soulingoTextResponse = await geminiService.chat(chatHistory, text);
      }

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai-text',
        // Fix: Changed MessageSender.Suolingo to MessageSender.Soulingo
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
        // Fix: Changed MessageSender.Suolingo to MessageSender.Soulingo
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 antialiased">
      <header className="fixed top-0 w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-md z-20">
        {/* Fix: Changed header title from Suolingo to Soulingo */}
        <h1 className="text-3xl font-bold text-center">Soulingo</h1>
        <p className="text-center text-sm mt-1 opacity-90">Senin akıllı İngilizce öğretmenin</p>
      </header>

      <main className="flex-grow overflow-y-auto p-4 pt-20 pb-20 space-y-4">
        {chatHistory.map((message) => (
          <MessageDisplay key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center justify-center p-2 text-blue-600">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Yükleniyor...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center p-2 text-red-600">
            <p>{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Scroll to this div */}
      </main>

      <div className="fixed bottom-0 w-full bg-white p-4 shadow-lg flex items-center border-t border-gray-200 z-10">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={triggerFileInput}
          disabled={isLoading}
          className="flex-shrink-0 p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-colors duration-200 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Kamera veya Resim Yükle"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-4 3 3 5-5V15z" clipRule="evenodd"></path>
          </svg>
        </button>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

// Fix: Changed default export from Suolingo to Soulingo
export default Soulingo;