import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Palette,
  RefreshCw,
  Sparkles,
  Maximize2,
  Check,
  Edit3
} from 'lucide-react';
import { ColoringPage } from '../types';

interface PageDetailModalProps {
  page: ColoringPage;
  childName: string;
  onClose: () => void;
  onOpenColoringStudio: (page: ColoringPage) => void;
  onRegeneratePage: (pageId: number, customPrompt?: string) => void;
}

export const PageDetailModal: React.FC<PageDetailModalProps> = ({
  page,
  childName,
  onClose,
  onOpenColoringStudio,
  onRegeneratePage,
}) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [promptText, setPromptText] = useState(page.prompt);

  const handlePrintSinglePage = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !page.imageUrl) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${childName}'s Coloring Page - Page ${page.id}: ${page.title}</title>
          <style>
            @page { size: letter portrait; margin: 10mm; }
            body { font-family: sans-serif; text-align: center; margin: 0; padding: 10px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 12px; }
            .title { font-size: 20px; font-weight: bold; }
            .child { font-size: 14px; color: #555; }
            img { max-width: 95%; max-height: 80vh; object-fit: contain; }
            .quest { margin-top: 15px; font-size: 14px; color: #333; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="title">Page ${page.id}: ${page.title}</span>
            <span class="child">Created for ${childName}</span>
          </div>
          <img src="${page.userDrawingUrl || page.imageUrl}" />
          <div class="quest">
            <strong>Coloring Quest:</strong> ${page.shortCaption}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadSingle = () => {
    if (!page.imageUrl) return;
    const a = document.createElement('a');
    a.href = page.userDrawingUrl || page.imageUrl;
    a.download = `${childName.toLowerCase().replace(/\s+/g, '-')}-page-${page.id}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                {page.id}
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                {page.title}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Personalized for {childName} • Thick Black-and-White Line Art
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-center">
          {/* Large Image Preview with high contrast */}
          <div className="flex-1 w-full max-h-[60vh] flex items-center justify-center bg-neutral-50 rounded-2xl border border-neutral-200 p-2">
            <img
              src={page.userDrawingUrl || page.imageUrl}
              alt={page.title}
              className="max-h-[58vh] max-w-full object-contain filter contrast-125"
            />
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Story Snippet
              </span>
              <p className="text-xs sm:text-sm text-neutral-700 italic bg-amber-50 p-3 rounded-xl border border-amber-200/60">
                "{page.storySnippet}"
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                Coloring Quest
              </span>
              <p className="text-xs sm:text-sm text-neutral-800 font-medium bg-rose-50/60 p-3 rounded-xl border border-rose-200/60">
                {page.shortCaption}
              </p>
            </div>

            {/* Prompt tweak box */}
            {isEditingPrompt ? (
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <label className="text-[11px] font-bold text-neutral-600 block">
                  Modify Line Art Prompt:
                </label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-rose-200"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingPrompt(false)}
                    className="text-xs text-neutral-500 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onRegeneratePage(page.id, promptText);
                      setIsEditingPrompt(false);
                      onClose();
                    }}
                    className="text-xs font-bold text-white bg-rose-500 px-3 py-1 rounded-lg"
                  >
                    Redraw Page
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingPrompt(true)}
                className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Fine-tune Image Prompt</span>
              </button>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <button
                onClick={() => {
                  onOpenColoringStudio(page);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Palette className="w-4 h-4" />
                <span>Color Online in Studio</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrintSinglePage}
                  className="py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-neutral-600" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={handleDownloadSingle}
                  className="py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-neutral-600" />
                  <span>Save Image</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onRegeneratePage(page.id);
                  onClose();
                }}
                className="w-full py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Redraw This Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
