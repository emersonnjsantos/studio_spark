import React, { useEffect, useState } from 'react';
import { X, Download, Printer, CheckCircle2, Sparkles, BookOpen, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ColoringBookData } from '../types';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  bookData: ColoringBookData;
  isGeneratingPdf: boolean;
  pdfProgressText?: string;
  onTriggerDownload: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  bookData,
  isGeneratingPdf,
  pdfProgressText,
  onTriggerDownload,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Launch cheerful confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
        });
      } catch (e) {
        // Ignore if blocked
      }

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBlob]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!pdfUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = pdfUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                  {bookData.childName}'s Coloring Book PDF
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Ready to Print
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Complete 5-Page Thick-Line Coloring Adventure with Custom Cover
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col items-center justify-center bg-neutral-100">
          {isGeneratingPdf ? (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h4 className="text-lg font-bold text-neutral-800">
                Assembling Your Personalized PDF...
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {pdfProgressText || 'Stitching together your custom cover, thick-line coloring pages, and artist certificate.'}
              </p>
            </div>
          ) : pdfUrl ? (
            <div className="w-full h-full flex flex-col sm:flex-row gap-6">
              {/* PDF Preview Frame */}
              <div className="flex-1 bg-white rounded-2xl border border-neutral-300 shadow-inner overflow-hidden flex flex-col">
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  title="PDF Preview"
                  className="w-full flex-1 border-0"
                />
              </div>

              {/* Sidebar Info & Controls */}
              <div className="w-full sm:w-72 bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Book Specification
                    </span>
                    <h4 className="font-extrabold text-sm text-neutral-900">
                      {bookData.bookTitle}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Dedicated to: <strong className="text-neutral-800">{bookData.childName}</strong>
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Page 1: Personalized Front Cover</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Pages 2-6: Five Thick-Line Coloring Sheets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Page 7: Official Master Artist Certificate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Resolution: {bookData.imageResolution} Print Ready</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <button
                    onClick={onTriggerDownload}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Directly</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-neutral-400">
              No PDF ready to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
