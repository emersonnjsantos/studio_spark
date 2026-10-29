import { AgeGroup, ImageResolution, AspectRatio, StorylineResponse } from '../types';

export async function fetchStoryline(
  childName: string,
  theme: string,
  ageGroup: AgeGroup
): Promise<StorylineResponse> {
  const response = await fetch('/api/storyline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ childName, theme, ageGroup }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to brainstorm coloring book story');
  }

  return response.json();
}

export async function generateColoringImage(options: {
  prompt: string;
  imageSize: ImageResolution;
  aspectRatio: AspectRatio;
  isCover?: boolean;
  childName?: string;
}): Promise<{ imageUrl: string; modelUsed: string; resolution: string }> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate coloring page illustration');
  }

  return response.json();
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  model: 'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite' = 'gemini-3.8-flash',
  context?: { childName?: string; theme?: string }
): Promise<{ reply: string; suggestedThemes?: string[]; modelUsed: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, context }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Chat assistant encountered an error');
  }

  return response.json();
}
