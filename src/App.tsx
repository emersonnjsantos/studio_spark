import React, { useState } from 'react';
import {
  AgeGroup,
  ImageResolution,
  AspectRatio,
  ColoringBookData,
  ColoringPage
} from './types';
import { fetchStoryline, generateColoringImage } from './services/api';
import { generateColoringBookPdf } from './services/pdfGenerator';
import { Navbar } from './components/Navbar';
import { BookCreator } from './components/BookCreator';
import { PagesGrid } from './components/PagesGrid';
import { PageDetailModal } from './components/PageDetailModal';
import { DigitalColoringStudio } from './components/DigitalColoringStudio';
import { ChatAssistant } from './components/ChatAssistant';
import { PdfPreviewModal } from './components/PdfPreviewModal';

export default function App() {
  const [childName, setChildName] = useState<string>('Leo');
  const [theme, setTheme] = useState<string>('Space Dinosaurs');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('preschool');
  const [imageResolution, setImageResolution] = useState<ImageResolution>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');

  const [bookData, setBookData] = useState<ColoringBookData | null>(null);
  const [activeTab, setActiveTab] = useState<'creator' | 'pages' | 'studio'>('creator');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingProgressText, setGeneratingProgressText] = useState<string>('');

  // Modals & Panels
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedPageForDetail, setSelectedPageForDetail] = useState<ColoringPage | null>(null);
  const [selectedPageForColoring, setSelectedPageForColoring] = useState<ColoringPage | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgressText, setPdfProgressText] = useState<string>('');

  // Handle Generating the Entire 5-Page Coloring Book
  const handleGenerateBook = async () => {
    if (!childName.trim() || !theme.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratingProgressText('Dreaming up a personalized 5-page storyline with Pip AI...');

    try {
      // Step 1: Brainstorm the cohesive 5-page storyline
      const storyline = await fetchStoryline(childName.trim(), theme.trim(), ageGroup);

      // Step 2: Initialize the book data structure
      const initialPages: ColoringPage[] = storyline.pages.map((p) => ({
        id: p.pageNumber,
        title: p.title,
        shortCaption: p.shortCaption,
        storySnippet: p.storySnippet,
        prompt: p.imagePrompt,
        status: 'generating',
      }));

      const newBook: ColoringBookData = {
        childName: childName.trim(),
        theme: theme.trim(),
        ageGroup,
        imageResolution,
        aspectRatio,
        bookTitle: storyline.bookTitle || `${childName}'s ${theme} Adventures`,
        bookSubtitle: storyline.bookSubtitle || `A 5-page coloring journey created specially for ${childName}`,
        coverStyle: 'stars',
        coverStatus: 'generating',
        pages: initialPages,
        createdAt: new Date().toLocaleDateString(),
      };

      setBookData(newBook);
      setActiveTab('pages');

      // Step 3: Concurrently generate cover hero and page illustrations
      // Generate Cover Illustration
      generateColoringImage({
        prompt: storyline.coverPrompt || `Whimsical coloring book front cover title banner for "${childName}'s ${theme}"`,
        imageSize: imageResolution,
        aspectRatio,
        isCover: true,
        childName: childName.trim(),
      })
        .then((coverRes) => {
          setBookData((prev) => (prev ? { ...prev, coverIllustrationUrl: coverRes.imageUrl, coverStatus: 'completed' } : null));
        })
        .catch((err) => {
          console.warn('Cover illustration error:', err);
          setBookData((prev) => (prev ? { ...prev, coverStatus: 'error' } : null));
        });

      // Generate the 5 distinct pages
      for (let i = 0; i < storyline.pages.length; i++) {
        const pageItem = storyline.pages[i];
        setGeneratingProgressText(`Drawing Page ${pageItem.pageNumber} of 5: ${pageItem.title}...`);

        try {
          const imgRes = await generateColoringImage({
            prompt: pageItem.imagePrompt,
            imageSize: imageResolution,
            aspectRatio,
            isCover: false,
            childName: childName.trim(),
          });

          setBookData((prev) => {
            if (!prev) return null;
            const updatedPages = prev.pages.map((pg) =>
              pg.id === pageItem.pageNumber
                ? { ...pg, imageUrl: imgRes.imageUrl, status: 'completed' as const }
                : pg
            );
            return { ...prev, pages: updatedPages };
          });
        } catch (pageError: any) {
          console.error(`Error generating page ${pageItem.pageNumber}:`, pageError);
          setBookData((prev) => {
            if (!prev) return null;
            const updatedPages = prev.pages.map((pg) =>
              pg.id === pageItem.pageNumber
                ? { ...pg, status: 'error' as const, errorMessage: pageError.message }
                : pg
            );
            return { ...prev, pages: updatedPages };
          });
        }
      }

      setGeneratingProgressText('All 5 pages ready for printing and coloring!');
    } catch (err: any) {
      console.error('Failed to generate coloring book:', err);
      alert(`Could not create coloring book: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate an individual page
  const handleRegeneratePage = async (pageId: number, customPrompt?: string) => {
    if (!bookData) return;

    // Set page to generating
    setBookData((prev) => {
      if (!prev) return null;
      const updated = prev.pages.map((p) =>
        p.id === pageId ? { ...p, status: 'generating' as const, prompt: customPrompt || p.prompt } : p
      );
      return { ...prev, pages: updated };
    });

    try {
      const pageToUpdate = bookData.pages.find((p) => p.id === pageId);
      const promptToUse = customPrompt || pageToUpdate?.prompt || `${bookData.theme} scene for children`;

      const imgRes = await generateColoringImage({
        prompt: promptToUse,
        imageSize: bookData.imageResolution,
        aspectRatio: bookData.aspectRatio,
        isCover: false,
        childName: bookData.childName,
      });

      setBookData((prev) => {
        if (!prev) return null;
        const updated = prev.pages.map((p) =>
          p.id === pageId
            ? { ...p, imageUrl: imgRes.imageUrl, status: 'completed' as const, userDrawingUrl: undefined }
            : p
        );
        return { ...prev, pages: updated };
      });
    } catch (error: any) {
      console.error(`Failed to redraw page ${pageId}:`, error);
      setBookData((prev) => {
        if (!prev) return null;
        const updated = prev.pages.map((p) =>
          p.id === pageId ? { ...p, status: 'error' as const, errorMessage: error.message } : p
        );
        return { ...prev, pages: updated };
      });
    }
  };

  // Regenerate Cover
  const handleRegenerateCover = async () => {
    if (!bookData) return;
    setBookData((prev) => (prev ? { ...prev, coverStatus: 'generating' } : null));

    try {
      const coverRes = await generateColoringImage({
        prompt: `Delightful coloring book cover banner for "${bookData.childName}'s ${bookData.theme}"`,
        imageSize: bookData.imageResolution,
        aspectRatio: bookData.aspectRatio,
        isCover: true,
        childName: bookData.childName,
      });

      setBookData((prev) =>
        prev ? { ...prev, coverIllustrationUrl: coverRes.imageUrl, coverStatus: 'completed' } : null
      );
    } catch (err: any) {
      console.error('Failed to regenerate cover:', err);
      setBookData((prev) => (prev ? { ...prev, coverStatus: 'error' } : null));
    }
  };

  // Save digital drawing for a page
  const handleSaveColoring = (pageId: number, drawingDataUrl: string) => {
    setBookData((prev) => {
      if (!prev) return null;
      const updated = prev.pages.map((p) =>
        p.id === pageId ? { ...p, userDrawingUrl: drawingDataUrl } : p
      );
      return { ...prev, pages: updated };
    });
  };

  // Prepare and open PDF Preview Modal
  const handleDownloadPdf = async () => {
    if (!bookData) return;
    setIsPdfModalOpen(true);
    setIsGeneratingPdf(true);
    setPdfProgressText('Formatting customized printable PDF...');

    try {
      const blob = await generateColoringBookPdf(bookData, (progress) => {
        setPdfProgressText(progress);
      });
      setPdfBlob(blob);
    } catch (err: any) {
      console.error('Error creating PDF:', err);
      alert('Could not compile PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct file download trigger
  const handleTriggerDownloadFile = () => {
    if (!pdfBlob || !bookData) return;
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedChild = bookData.childName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const sanitizedTheme = bookData.theme.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `${sanitizedChild}-${sanitizedTheme}-coloring-book.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Print book action
  const handlePrintBook = async () => {
    if (!bookData) return;
    handleDownloadPdf();
  };

  // Apply theme from Chatbot
  const handleApplyThemeFromChat = (newTheme: string) => {
    // Strip leading emoji or brackets if present
    const cleanTheme = newTheme.replace(/^\[Theme:\s*/i, '').replace(/\]$/, '').trim();
    setTheme(cleanTheme);
    setActiveTab('creator');
  };

  const completedPagesCount = bookData
    ? bookData.pages.filter((p) => p.status === 'completed' && p.imageUrl).length
    : 0;

  return (
    <div className="min-h-screen bg-neutral-50/60 text-neutral-900 flex flex-col font-sans selection:bg-rose-200">
      {/* Top Navigation */}
      <Navbar
        completedPagesCount={completedPagesCount}
        totalPages={bookData ? bookData.pages.length : 5}
        isGenerating={isGenerating}
        onOpenChat={() => setIsChatOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onPrintBook={handlePrintBook}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasBook={!!bookData}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {activeTab === 'creator' && (
          <BookCreator
            childName={childName}
            setChildName={setChildName}
            theme={theme}
            setTheme={setTheme}
            ageGroup={ageGroup}
            setAgeGroup={setAgeGroup}
            imageResolution={imageResolution}
            setImageResolution={setImageResolution}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            isGenerating={isGenerating}
            onGenerateBook={handleGenerateBook}
            bookData={bookData}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}

        {activeTab === 'pages' && bookData && (
          <PagesGrid
            bookData={bookData}
            onSelectPageForDetail={(page) => setSelectedPageForDetail(page)}
            onSelectPageForColoring={(page) => setSelectedPageForColoring(page)}
            onRegeneratePage={handleRegeneratePage}
            onRegenerateCover={handleRegenerateCover}
            onDownloadPdf={handleDownloadPdf}
            onPrintBook={handlePrintBook}
            isGenerating={isGenerating}
            generatingProgressText={generatingProgressText}
          />
        )}

        {activeTab === 'studio' && bookData && (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-4">Select a Page to Color Online:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bookData.pages.map((pg) => (
                <div
                  key={pg.id}
                  onClick={() => pg.imageUrl && setSelectedPageForColoring(pg)}
                  className="bg-white rounded-2xl p-4 border border-neutral-200 hover:shadow-lg cursor-pointer transition-all space-y-2"
                >
                  <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center">
                    {pg.imageUrl ? (
                      <img src={pg.userDrawingUrl || pg.imageUrl} alt={pg.title} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-neutral-400">Not drawn yet</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-neutral-800">Page {pg.id}: {pg.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Pip Chatbot */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full p-4 shadow-xl shadow-indigo-500/30 flex items-center gap-2.5 transition-transform hover:scale-105"
          title="Chat with Pip AI"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-sm pr-1">Brainstorm with Pip AI</span>
        </button>
      )}

      {/* Modals */}
      <ChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        childName={childName}
        currentTheme={theme}
        onApplyTheme={handleApplyThemeFromChat}
      />

      {selectedPageForDetail && (
        <PageDetailModal
          page={selectedPageForDetail}
          childName={bookData?.childName || childName}
          onClose={() => setSelectedPageForDetail(null)}
          onOpenColoringStudio={(page) => setSelectedPageForColoring(page)}
          onRegeneratePage={handleRegeneratePage}
        />
      )}

      {selectedPageForColoring && (
        <DigitalColoringStudio
          page={selectedPageForColoring}
          childName={bookData?.childName || childName}
          onSaveColoring={handleSaveColoring}
          onClose={() => setSelectedPageForColoring(null)}
        />
      )}

      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfBlob={pdfBlob}
        bookData={bookData || {
          childName,
          theme,
          ageGroup,
          imageResolution,
          aspectRatio,
          bookTitle: `${childName}'s Coloring Book`,
          bookSubtitle: 'Ready for print',
          coverStyle: 'stars',
          pages: [],
          createdAt: '',
        }}
        isGeneratingPdf={isGeneratingPdf}
        pdfProgressText={pdfProgressText}
        onTriggerDownload={handleTriggerDownloadFile}
      />
    </div>
  );
}
