import React from 'react';
import { Sparkles, Wand2, User, Palette, Layers, CheckCircle2, Sliders, Info } from 'lucide-react';
import { AgeGroup, ImageResolution, AspectRatio, ColoringBookData } from '../types';

interface BookCreatorProps {
  childName: string;
  setChildName: (name: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  ageGroup: AgeGroup;
  setAgeGroup: (age: AgeGroup) => void;
  imageResolution: ImageResolution;
  setImageResolution: (res: ImageResolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  isGenerating: boolean;
  onGenerateBook: () => void;
  bookData: ColoringBookData | null;
  onOpenChat: () => void;
}

const PRESET_THEMES = [
  { label: 'Space Dinosaurs 🚀🦕', theme: 'Space Dinosaurs with rocket packs and planetary moons' },
  { label: 'Deep Ocean Submarine 🐙🌊', theme: 'Undersea exploration with playful octopuses, submarines, and coral' },
  { label: 'Enchanted Fairy Bakery 🧚‍♀️🧁', theme: 'Tiny woodland fairies baking giant cupcakes and mushroom sweets' },
  { label: 'Super Hero Puppies 🐶⚡', theme: 'Heroic caped puppy squad saving the city park with cool gadgets' },
  { label: 'Robot Safari Adventure 🤖🦁', theme: 'Friendly safari robots photographing mechanical lions and giraffes' },
  { label: 'Rainbow Dragon Kingdom 🐉🌈', theme: 'Baby dragons sliding down rainbows around a floating castle' },
  { label: 'Cozy Farm Animals 🚜🐷', theme: 'Happy piglets, fluffy sheep, and tractors on a sunny farm' },
  { label: 'Race Car Animals 🏎️🏁', theme: 'Cheetahs and bears zooming fast sports cars on a fun racetrack' },
];

export const BookCreator: React.FC<BookCreatorProps> = ({
  childName,
  setChildName,
  theme,
  setTheme,
  ageGroup,
  setAgeGroup,
  imageResolution,
  setImageResolution,
  aspectRatio,
  setAspectRatio,
  isGenerating,
  onGenerateBook,
  bookData,
  onOpenChat,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span>AI-Powered Children's Coloring Book Maker</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900">
          Personalized 5-Page <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600">Coloring Books</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
          Enter your child's name and any imaginative theme. We'll generate 5 cohesive, thick-outline printable coloring sheets plus a personalized custom cover ready for printing or instant coloring!
        </p>
      </div>

      {/* Main Creation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xl shadow-neutral-100 space-y-8">
        {/* Step 1: Child Name & Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Child's Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <User className="w-4 h-4 text-rose-500" />
              <span>Child's Name</span>
              <span className="text-xs font-normal text-neutral-400">(Appears on cover & pages)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Maya, Leo, Oliver..."
                className="w-full px-4 py-3 rounded-2xl border border-neutral-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 text-neutral-900 placeholder:text-neutral-400 font-medium transition-all"
                disabled={isGenerating}
              />
              {childName && (
                <div className="absolute right-3.5 top-3.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  ★ Star of the book!
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              The entire coloring book will be dedicated to and personalized for this child.
            </p>
          </div>

          {/* Theme Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>Storybook Theme</span>
              </label>
              <button
                type="button"
                onClick={onOpenChat}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>Need ideas? Ask Pip</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Space Dinosaurs, Cupcake Knights, Ocean Explorers..."
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 text-neutral-900 placeholder:text-neutral-400 font-medium transition-all"
              disabled={isGenerating}
            />
            <p className="text-xs text-neutral-500">
              Anything your child loves! Animals, vehicles, fantasy, sports, or silly mashups.
            </p>
          </div>
        </div>

        {/* Quick Theme Presets */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>Popular Themes (Click to Pick)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_THEMES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setTheme(item.theme)}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  theme === item.theme
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Line Art Complexity (Age Group) */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <label className="block text-sm font-bold text-neutral-800">
            Age & Line-Art Complexity
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'toddler' as AgeGroup,
                title: 'Toddler (Ages 2-4)',
                desc: 'Extra-bold thick contours, very simple friendly shapes, huge coloring zones.',
                badge: 'Thickest Outlines',
              },
              {
                id: 'preschool' as AgeGroup,
                title: 'Preschool (Ages 5-7)',
                desc: 'Playful characters, fun background items, balanced bold outlines.',
                badge: 'Most Popular',
              },
              {
                id: 'elementary' as AgeGroup,
                title: 'Kids (Ages 8+)',
                desc: 'Richer detailed scenes, creative patterns, dynamic cartoon compositions.',
                badge: 'Detailed Fun',
              },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAgeGroup(option.id)}
                disabled={isGenerating}
                className={`text-left p-4 rounded-2xl border-2 transition-all relative ${
                  ageGroup === option.id
                    ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-neutral-900">{option.title}</span>
                  {ageGroup === option.id && <CheckCircle2 className="w-4 h-4 text-rose-500" />}
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{option.desc}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {option.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: High-Quality Image Resolution Affordance (gemini-3-pro-image-preview) */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Image Resolution & Quality</span>
              </label>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                gemini-3-pro-image-preview
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-400">
              <Info className="w-3.5 h-3.5" />
              <span>Crisp for high-DPI printer ink</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: '1K' as ImageResolution,
                label: '1K Resolution',
                detail: 'Fast generation • Great for screens & standard prints',
              },
              {
                id: '2K' as ImageResolution,
                label: '2K Resolution',
                detail: 'High Definition • Crisp clean lines for inkjet & laser',
              },
              {
                id: '4K' as ImageResolution,
                label: '4K Resolution',
                detail: 'Ultra-Sharp • Maximum precision for keepsake books',
              },
            ].map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => setImageResolution(res.id)}
                disabled={isGenerating}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  imageResolution === res.id
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 font-medium'
                }`}
              >
                <div className="text-sm font-extrabold">{res.label}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5 hidden sm:block">{res.detail}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Aspect Ratio */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-100">
          <div>
            <label className="text-sm font-bold text-neutral-800 block">Page Format</label>
            <p className="text-xs text-neutral-500">Optimized for standard letter and coloring sheet binders.</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: '3:4' as AspectRatio, label: '3:4 Portrait (Recommended for Print)' },
              { id: '1:1' as AspectRatio, label: '1:1 Square' },
              { id: '4:3' as AspectRatio, label: '4:3 Landscape' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setAspectRatio(r.id)}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  aspectRatio === r.id
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onGenerateBook}
            disabled={isGenerating || !childName.trim() || !theme.trim()}
            className={`w-full py-4 px-6 rounded-2xl text-base sm:text-lg font-extrabold shadow-lg flex items-center justify-center gap-3 transition-all ${
              isGenerating || !childName.trim() || !theme.trim()
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:opacity-95 text-white shadow-rose-200 hover:shadow-xl hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin" />
                <span>Crafting 5-Page Storyline & Drawing Outlines...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {bookData ? 'Generate New 5-Page Coloring Book' : 'Generate 5-Page Coloring Book'}
                </span>
              </>
            )}
          </button>
          {!childName.trim() && (
            <p className="text-center text-xs text-rose-500 font-medium mt-2">
              Please enter your child's name to personalize the cover!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
