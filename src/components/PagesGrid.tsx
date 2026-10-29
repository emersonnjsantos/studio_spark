import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Palette,
  Maximize2,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Edit3,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { ColoringBookData, ColoringPage } from '../types';

interface PagesGridProps {
  bookData: ColoringBookData;
  onSelectPageForDetail: (page: ColoringPage) => void;
  onSelectPageForColoring: (page: ColoringPage) => void;
  onRegeneratePage: (pageId: number, customPrompt?: string) => void;
  onRegenerateCover: () => void;
  onDownloadPdf: () => void;
  onPrintBook: () => void;
  isGenerating: boolean;
  generatingProgressText?: string;
}

export const PagesGrid: React.FC<PagesGridProps> = ({
  bookData,
  onSelectPageForDetail,
  onSelectPageForColoring,
  onRegeneratePage,
  onRegenerateCover,
  onDownloadPdf,
  onPrintBook,
  isGenerating,
  generatingProgressText,
}) => {
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [customPromptText, setCustomPromptText] = useState<string>('');

  const completedPagesCount = bookData.pages.filter((p) => p.status === 'completed' && p.imageUrl).length;
  const progressPercent = Math.round((completedPagesCount / 5) * 100);

  const startEditPrompt = (page: ColoringPage) => {
    setEditingPageId(page.id);
    setCustomPromptText(page.prompt);
  };

  const submitEditPrompt = (pageId: number) => {
    onRegeneratePage(pageId, customPromptText);
    setEditingPageId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Header Bar with Book Info & Quick Actions */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Sparkle Doodles */}
        <div className="absolute right-4 top-4 text-white/5 text-9xl font-black select-none pointer-events-none">
          ★
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ★ Personalized Edition for {bookData.childName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                {bookData.imageResolution} Quality
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {bookData.bookTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              {bookData.bookSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onPrintBook}
              disabled={completedPagesCount === 0 || isGenerating}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Book</span>
            </button>
            <button
              onClick={onDownloadPdf}
              disabled={completedPagesCount === 0 || isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-950/40 flex items-center gap-2 transition-all disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete PDF ({completedPagesCount}/5 Ready)</span>
            </button>
          </div>
        </div>

        {/* Live Generation Progress Bar */}
        {(isGenerating || completedPagesCount < 5) && (
          <div className="mt-6 pt-5 border-t border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-2">
                {isGenerating && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                <span>{generatingProgressText || `Generating book illustrations (${completedPagesCount}/5 complete)...`}</span>
              </span>
              <span className="font-bold text-amber-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid: Cover Page Card + 5 Distinct Coloring Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Card 0: Custom Book Cover */}
        <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-amber-300 shadow-md flex flex-col justify-between relative group hover:shadow-xl transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900 flex items-center gap-1">
                <span>★ Page 0: Cover</span>
              </span>
              <span className="text-[11px] font-bold text-neutral-500">
                Front Cover Page
              </span>
            </div>

            {/* Cover Preview Frame */}
            <div className="aspect-[3/4] bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden relative flex flex-col items-center justify-center p-4 text-center">
              {bookData.coverIllustrationUrl ? (
                <img
                  src={bookData.coverIllustrationUrl}
                  alt="Custom Cover"
                  className="w-full h-full object-contain filter contrast-125"
                />
              ) : bookData.pages[0]?.imageUrl ? (
                <div className="w-full h-full relative">
                  <img
                    src={bookData.pages[0].imageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-contain opacity-80 filter contrast-125"
                  />
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-3">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400">
                      Coloring Book Cover
                    </span>
                    <h3 className="text-xl font-black text-neutral-900 mt-1">
                      {bookData.childName.toUpperCase()}'S
                    </h3>
                    <p className="text-xs font-bold text-neutral-700">
                      {bookData.bookTitle}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-neutral-800 text-sm">
                    {bookData.childName.toUpperCase()}'S COLORING BOOK
                  </h4>
                  <p className="text-xs text-neutral-500 px-2">
                    Custom Title Page with child's name ready for printing
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-neutral-900 text-base">
                Personalized Cover Page
              </h3>
              <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                Included as Page 1 in your downloaded PDF with {bookData.childName}'s name in bold display lettering!
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-400">PDF Front Cover</span>
            <button
              onClick={onRegenerateCover}
              disabled={isGenerating}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Cover Hero</span>
            </button>
          </div>
        </div>

        {/* Cards 1 to 5: The 5 Coloring Pages */}
        {bookData.pages.map((page) => (
          <div
            key={page.id}
            className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {page.id}
                  </span>
                  <span className="font-bold text-neutral-900 text-sm truncate max-w-[170px]">
                    {page.title}
                  </span>
                </div>

                {/* Status Badge */}
                {page.status === 'generating' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Drawing...</span>
                  </span>
                )}
                {page.status === 'completed' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ready</span>
                  </span>
                )}
                {page.status === 'error' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    <span>Failed</span>
                  </span>
                )}
              </div>

              {/* Coloring Page Image Preview Box */}
              <div
                className="aspect-[3/4] bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden relative group/image cursor-pointer flex items-center justify-center"
                onClick={() => page.imageUrl && onSelectPageForDetail(page)}
              >
                {page.status === 'completed' && page.imageUrl ? (
                  <>
                    <img
                      src={page.userDrawingUrl || page.imageUrl}
                      alt={page.title}
                      className="w-full h-full object-contain p-2 filter contrast-125"
                    />
                    {page.userDrawingUrl && (
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        🎨 Colored by You!
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-white text-neutral-900 text-xs font-bold shadow-md flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </span>
                    </div>
                  </>
                ) : page.status === 'generating' ? (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
                      <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    <p className="text-xs font-bold text-neutral-700">
                      Drawing Page {page.id}...
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Creating thick black line art outlines
                    </p>
                  </div>
                ) : page.status === 'error' ? (
                  <div className="text-center p-6 space-y-2">
                    <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                    <p className="text-xs font-bold text-neutral-700">Drawing failed</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegeneratePage(page.id);
                      }}
                      className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 text-neutral-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">Waiting in queue...</span>
                  </div>
                )}
              </div>

              {/* Story Snippet & Quest Challenge */}
              <div className="space-y-1.5">
                <p className="text-xs text-neutral-600 italic line-clamp-2">
                  "{page.storySnippet}"
                </p>
                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
                  <div className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider">
                    Coloring Quest:
                  </div>
                  <p className="text-xs font-medium text-neutral-800 line-clamp-2">
                    {page.shortCaption}
                  </p>
                </div>
              </div>

              {/* Inline Prompt Tweaker Accordion */}
              {editingPageId === page.id && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <label className="text-[11px] font-bold text-neutral-700 block">
                    Custom Image Prompt for Page {page.id}:
                  </label>
                  <textarea
                    rows={3}
                    value={customPromptText}
                    onChange={(e) => setCustomPromptText(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-rose-200"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPageId(null)}
                      className="text-xs text-neutral-500 px-2 py-1 rounded hover:bg-neutral-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitEditPrompt(page.id)}
                      className="text-xs font-bold text-white bg-rose-500 px-3 py-1 rounded-lg hover:bg-rose-600"
                    >
                      Regenerate with prompt
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Actions */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {page.imageUrl && (
                  <button
                    onClick={() => onSelectPageForColoring(page)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Color this page right in your browser!"
                  >
                    <Palette className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Color</span>
                  </button>
                )}
                <button
                  onClick={() => startEditPrompt(page)}
                  className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700"
                  title="Edit prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onRegeneratePage(page.id)}
                  disabled={page.status === 'generating'}
                  className="px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Regenerate this page"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${page.status === 'generating' ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Redraw</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
