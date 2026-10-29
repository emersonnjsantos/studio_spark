import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Wand2,
  RefreshCw,
  Cpu,
  Check,
  ChevronRight
} from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  currentTheme: string;
  onApplyTheme: (theme: string) => void;
}

type ModelChoice = 'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite';

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  isOpen,
  onClose,
  childName,
  currentTheme,
  onApplyTheme,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hi there! I'm **Pip**, your magical coloring book creative director and storyteller! 🎨✨\n\nI can help you:\n• Brainstorm dream themes for **${childName || 'your child'}**\n• Plan out exciting 5-page story adventures\n• Suggest bright crayon & marker color palettes\n• Come up with silly coloring quests!\n\nWhat kind of coloring book should we imagine today?`,
      timestamp: Date.now(),
      suggestedThemes: ['Space Dinosaurs 🚀🦕', 'Ocean Mermaids 🧜‍♀️🐠', 'Robot Bakery 🤖🧁', 'Dragon Forest 🐉🌲'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelChoice>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedThemeSuccess, setAppliedThemeSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(apiMessages, selectedModel, {
        childName,
        theme: currentTheme,
      });

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: Date.now(),
        suggestedThemes: res.suggestedThemes,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Oops! I had a little hiccup: ${err.message || 'Could not connect'}. Let's try again!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyThemeClick = (themeName: string) => {
    onApplyTheme(themeName);
    setAppliedThemeSuccess(themeName);
    setTimeout(() => setAppliedThemeSuccess(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-neutral-200 flex flex-col">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-indigo-950 rounded-[14px] flex items-center justify-center text-lg">
              🎨
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight text-white">Pip AI</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-700/80 text-amber-300 border border-indigo-500/30">
                Coloring Director
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Creative Storyteller & Theme Assistant
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Model Selection Toolbar */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span>Model:</span>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as ModelChoice)}
          className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-950 focus:ring-2 focus:ring-indigo-300 outline-none"
        >
          <option value="gemini-3.8-flash">gemini-3.8-flash (General - Recommended)</option>
          <option value="gemini-4-argon">gemini-4-argon (Complex Story Reasoning)</option>
          <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
        </select>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center text-xs shadow-xs">
                🎨
              </div>
            )}

            <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-rose-500 text-white rounded-tr-xs font-medium'
                    : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-xs'
                }`}
              >
                {msg.content}
              </div>

              {/* Clickable suggested theme pills */}
              {msg.suggestedThemes && msg.suggestedThemes.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block w-full">
                    Quickly apply theme to book:
                  </span>
                  {msg.suggestedThemes.map((th) => (
                    <button
                      key={th}
                      onClick={() => handleApplyThemeClick(th)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
                        appliedThemeSuccess === th
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200 shadow-xs'
                      }`}
                    >
                      {appliedThemeSuccess === th ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{th}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex-shrink-0 flex items-center justify-center text-xs shadow-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-neutral-500 text-xs pl-11">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] font-medium text-neutral-400 ml-1">
              Pip is dreaming up ideas...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      <div className="px-4 py-2 bg-neutral-100 border-t border-neutral-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-neutral-400 font-bold uppercase text-[9px] flex-shrink-0">
          Try Asking:
        </span>
        {[
          '5 Space Dinosaur Scenes',
          'Themes for age 4',
          'Silly Animal Bakery',
          'Crayon Palette Tips',
        ].map((quick) => (
          <button
            key={quick}
            onClick={() => handleSendMessage(`Can you suggest ${quick}?`)}
            className="flex-shrink-0 px-2 py-1 bg-white hover:bg-neutral-50 rounded-md border border-neutral-200 text-neutral-700 font-medium"
          >
            {quick}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-neutral-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Pip for themes, story ideas, or coloring tips..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
