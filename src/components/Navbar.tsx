import React from 'react';
import { Sparkles, BookOpen, Download, Printer, MessageCircle, Palette } from 'lucide-react';

interface NavbarProps {
  completedPagesCount: number;
  totalPages: number;
  isGenerating: boolean;
  onOpenChat: () => void;
  onDownloadPdf: () => void;
  onPrintBook: () => void;
  activeTab: 'creator' | 'pages' | 'studio';
  setActiveTab: (tab: 'creator' | 'pages' | 'studio') => void;
  hasBook: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  completedPagesCount,
  totalPages,
  isGenerating,
  onOpenChat,
  onDownloadPdf,
  onPrintBook,
  activeTab,
  setActiveTab,
  hasBook,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('creator')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Palette className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-neutral-900">
                Color<span className="text-rose-500">Spark</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Kids Book Studio
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">
              Printable Thick-Line Coloring Books
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        {hasBook && (
          <nav className="hidden md:flex items-center bg-neutral-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('creator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'creator'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Customizer
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'pages'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>5 Pages</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                {completedPagesCount}/{totalPages}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'studio'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color Digitally</span>
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chatbot Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold transition-colors"
            title="Chat with Pip, your AI coloring book storyteller & theme brainstormer"
          >
            <MessageCircle className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Ask Pip AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Print Button */}
          {hasBook && completedPagesCount > 0 && (
            <button
              onClick={onPrintBook}
              disabled={isGenerating}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Print coloring book directly"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>
          )}

          {/* Download PDF Button */}
          {hasBook && (
            <button
              onClick={onDownloadPdf}
              disabled={isGenerating || completedPagesCount === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all ${
                completedPagesCount > 0 && !isGenerating
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
              {completedPagesCount > 0 && (
                <span className="bg-rose-800 text-rose-100 text-[10px] px-1.5 py-0.5 rounded-full ml-0.5">
                  {completedPagesCount}/5
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
