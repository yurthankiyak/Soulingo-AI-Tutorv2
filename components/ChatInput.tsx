import React, { useState, ChangeEvent, FormEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-grow items-center">
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Mesajını buraya yaz..."
        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !inputText.trim()}
        className="ml-2 p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Gönder"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l.649-.186.38-1.153a1 1 0 00-1.523-1.056l-.16.16a1 1 0 01-1.414 0l-1.414 1.414a1 1 0 000 1.414L7.586 19H12.414l5.414-5.414a1 1 0 000-1.414l-1.414-1.414a1 1 0 01-1.414 0l-.16.16a1 1 0 00-1.523-1.056l.38-1.153.649-.186a1 1 0 001.169 1.409l-7-14z"></path>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0L7.586 9H5a1 1 0 100 2h2.586l1.707 1.707a1 1 0 001.414-1.414L9.414 10l1.293-1.293a1 1 0 000-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;
