import React, { useRef, useState, useEffect } from 'react';
import {
  Palette,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Save,
  ArrowLeft,
  Sparkles,
  Check,
  ZoomIn
} from 'lucide-react';
import { ColoringPage } from '../types';

interface DigitalColoringStudioProps {
  page: ColoringPage;
  childName: string;
  onSaveColoring: (pageId: number, drawingDataUrl: string) => void;
  onClose: () => void;
}

const CRAYON_PALETTE = [
  // Primary & vibrant
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  // Pastels & magical
  '#FCA5A5', '#FDBA74', '#FDE68A', '#A7F3D0', '#BAE6FD', '#C7D2FE', '#DDD6FE', '#FBCFE8',
  // Earth & neutrals
  '#78350F', '#92400E', '#B45309', '#D97706', '#475569', '#1E293B', '#000000', '#FFFFFF'
];

export const DigitalColoringStudio: React.FC<DigitalColoringStudioProps> = ({
  page,
  childName,
  onSaveColoring,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [brushSize, setBrushSize] = useState<number>(18);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'rainbow'>('brush');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const rainbowHueRef = useRef<number>(0);

  // Load line art onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !page.imageUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = page.userDrawingUrl || page.imageUrl;
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 1600;

      // Fill canvas with pure white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw coloring page centered
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Save initial state to history for undo
      const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
    };
  }, [page.id, page.imageUrl, page.userDrawingUrl]);

  // Coordinate helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.x) * scaleX,
      y: (clientY - rect.y) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history snapshot before starting stroke
    setHistory((prev) => [...prev.slice(-15), ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#FFFFFF';
    } else if (tool === 'rainbow') {
      ctx.globalCompositeOperation = 'multiply';
      rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 90%, 55%)`;
    } else {
      // Multiply mode lets color fill the white space while keeping black lines crisp!
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = selectedColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevSnapshot = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    ctx.putImageData(prevSnapshot, 0, 0);
  };

  const handleClear = () => {
    if (!page.imageUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = page.imageUrl; // Revert to original uncolored
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    };
  };

  const handleSaveToBook = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveColoring(page.id, dataUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${childName.toLowerCase().replace(/\s+/g, '-')}-page-${page.id}-colored.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-md flex flex-col">
      {/* Top Studio Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Back to Book"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base">
                Coloring Studio: Page {page.id} - {page.title}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                For {childName}
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              {page.shortCaption}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleDownloadPng}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>
          <button
            onClick={handleSaveToBook}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md transition-all ${
              savedSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Book!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save to Book</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Toolbar (Colors & Brushes) */}
        <div className="w-full md:w-80 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-5">
            {/* Tool Selection */}
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Drawing Tool
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTool('brush')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    tool === 'brush'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Crayon</span>
                </button>
                <button
                  onClick={() => setTool('rainbow')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    tool === 'rainbow'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Rainbow</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    tool === 'eraser'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  <span>Eraser</span>
                </button>
              </div>
            </div>

            {/* Brush Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
                <span>Crayon Tip Size</span>
                <span className="text-white">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="60"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex items-center justify-center pt-2">
                <div
                  className="rounded-full bg-white shadow-xs transition-all"
                  style={{
                    width: `${Math.min(brushSize, 40)}px`,
                    height: `${Math.min(brushSize, 40)}px`,
                    backgroundColor: tool === 'eraser' ? '#FFFFFF' : selectedColor,
                  }}
                />
              </div>
            </div>

            {/* Color Swatches */}
            {tool !== 'eraser' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Crayon Box ({CRAYON_PALETTE.length} Colors)
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      setTool('brush');
                    }}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    title="Custom Color"
                  />
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {CRAYON_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedColor(c);
                        setTool('brush');
                      }}
                      className={`w-9 h-9 rounded-xl border transition-transform ${
                        selectedColor === c && tool === 'brush'
                          ? 'scale-110 border-white ring-2 ring-white/50'
                          : 'border-neutral-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Actions */}
          <div className="pt-4 border-t border-neutral-800 flex gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-xs font-bold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              <span>Undo</span>
            </button>
            <button
              onClick={handleClear}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-red-900/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-neutral-950 p-4 sm:p-6 flex items-center justify-center overflow-auto">
          <div className="max-h-full max-w-full flex items-center justify-center relative shadow-2xl rounded-2xl overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair max-h-[80vh] w-auto object-contain touch-none select-none"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
