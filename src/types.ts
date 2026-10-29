export type AgeGroup = 'toddler' | 'preschool' | 'elementary';
export type ImageResolution = '1K' | '2K' | '4K';
export type AspectRatio = '3:4' | '1:1' | '4:3';

export interface ColoringPage {
  id: number;
  title: string;
  shortCaption: string;
  storySnippet: string;
  prompt: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
  userDrawingUrl?: string; // If user colors digitally
}

export interface ColoringBookData {
  childName: string;
  theme: string;
  ageGroup: AgeGroup;
  imageResolution: ImageResolution;
  aspectRatio: AspectRatio;
  bookTitle: string;
  bookSubtitle: string;
  coverStyle: 'stars' | 'crayons' | 'fantasy' | 'geometric';
  coverIllustrationUrl?: string;
  coverStatus?: 'idle' | 'generating' | 'completed' | 'error';
  pages: ColoringPage[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  suggestedThemes?: string[];
}

export interface StorylineResponse {
  bookTitle: string;
  bookSubtitle: string;
  coverPrompt: string;
  pages: Array<{
    pageNumber: number;
    title: string;
    shortCaption: string;
    storySnippet: string;
    imagePrompt: string;
  }>;
}
