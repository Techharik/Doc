import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
            D
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">DocuSum</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Powered by Gemini 2.5 Flash</span>
          <a 
            href="#"
            className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            v1.0
          </a>
        </div>
      </div>
    </header>
  );
};