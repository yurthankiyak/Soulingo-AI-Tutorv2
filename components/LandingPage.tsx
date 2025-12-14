import React from 'react';
import { AppMode } from '../types';

interface LandingPageProps {
  onSelectMode: (mode: AppMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-center">
      
      {/* Hero Section */}
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Soulingo
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto">
          Akademik ve profesyonel hayatınız için tasarlanmış, <span className="font-semibold text-blue-600">yapay zeka destekli</span> İngilizce öğretmeniniz.
        </p>
      </div>

      {/* Features Grid - Now Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        
        {/* Feature 1: Vision */}
        <button 
          onClick={() => onSelectMode('vision')}
          className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-blue-50 text-left group"
        >
          <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-600 transition-colors duration-300 rounded-full flex items-center justify-center mb-4 text-blue-600 group-hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Görsel Zeka</h3>
          <p className="text-gray-600 text-sm">
            Çevrenizdeki nesnelerin fotoğrafını çekin, İngilizce karşılıklarını ve örnek cümleleri anında öğrenin.
          </p>
          <span className="inline-block mt-4 text-blue-500 font-semibold text-sm">Resim Yükle &rarr;</span>
        </button>

        {/* Feature 2: Grammar */}
        <button 
          onClick={() => onSelectMode('chat')}
          className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-purple-50 text-left group"
        >
          <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-600 transition-colors duration-300 rounded-full flex items-center justify-center mb-4 text-purple-600 group-hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">Akıllı Sohbet</h3>
          <p className="text-gray-600 text-sm">
            İngilizce pratik yapın. Soulingo hatalarınızı nazikçe düzeltir ve daha profesyonel ifadeler önerir.
          </p>
          <span className="inline-block mt-4 text-purple-500 font-semibold text-sm">Sohbete Başla &rarr;</span>
        </button>

        {/* Feature 3: NotebookLM */}
        <button 
          onClick={() => onSelectMode('notebook')}
          className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-indigo-50 text-left group"
        >
          <div className="w-14 h-14 bg-indigo-100 group-hover:bg-indigo-600 transition-colors duration-300 rounded-full flex items-center justify-center mb-4 text-indigo-600 group-hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">NotebookLM</h3>
          <p className="text-gray-600 text-sm">
            Öğrendiğiniz yeni kelimeleri kaydedin veya kendi not dosyalarınızı (.txt) yükleyerek kişisel kütüphanenizi oluşturun.
          </p>
          <span className="inline-block mt-4 text-indigo-500 font-semibold text-sm">Notları Aç &rarr;</span>
        </button>

      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        © {new Date().getFullYear()} Soulingo AI Tutor
      </footer>
    </div>
  );
};

export default LandingPage;
