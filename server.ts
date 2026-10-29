import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Server-side initialization of GoogleGenAI SDK with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate a cohesive 5-page storyline & prompts for the coloring book
app.post('/api/storyline', async (req, res) => {
  try {
    const { childName = 'Little Artist', theme = 'Space Dinosaurs', ageGroup = 'preschool' } = req.body;

    const ageGuidelines = {
      toddler: 'Ages 2-4: Extremely simple, very large bold outlines, minimal clutter, big friendly subjects, toddler-friendly.',
      preschool: 'Ages 4-7: Playful, clear distinct thick outlines, fun background elements, charming cartoon characters.',
      elementary: 'Ages 8+: Richer scene details, creative patterns, dynamic poses, but still clean bold printable line art with wide coloring areas.',
    }[ageGroup as 'toddler' | 'preschool' | 'elementary'] || 'Clear thick outlines suitable for children.';

    const systemInstruction = `You are a children's book author and coloring book designer.
Create a structured 5-page coloring book storyline themed "${theme}" customized for a child named "${childName}".
Age suitability: ${ageGuidelines}.
Each page must be an exciting scene in a 5-step journey or adventure.
Every imagePrompt MUST be specifically crafted for black-and-white line art coloring pages:
- Pure black lines on clean white background.
- Thick, bold, crisp outlines.
- No colors, no grayscale, no shading, no gradient textures.
- Wide open spaces for coloring with crayons or markers.`;

    const promptText = `Generate a 5-page coloring book storyline for ${childName} with theme "${theme}".
Provide:
1. bookTitle (personalized title, e.g. "${childName}'s Awesome Space Dinosaur Journey")
2. bookSubtitle (catchy 1-sentence subtitle)
3. coverPrompt (coloring-book style cover hero art prompt)
4. Exactly 5 pages, numbered 1 to 5, each with:
   - pageNumber (1 to 5)
   - title (short 2-4 word scene title)
   - shortCaption (a fun 1-line prompt or coloring challenge for the child, e.g., "Color the rocket boosters fiery red!")
   - storySnippet (1-2 sentences advancing the cute story)
   - imagePrompt (detailed prompt for the image generator requesting thick black-and-white line art)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookTitle: { type: Type.STRING },
            bookSubtitle: { type: Type.STRING },
            coverPrompt: { type: Type.STRING },
            pages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pageNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  shortCaption: { type: Type.STRING },
                  storySnippet: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                },
                required: ['pageNumber', 'title', 'shortCaption', 'storySnippet', 'imagePrompt'],
              },
            },
          },
          required: ['bookTitle', 'bookSubtitle', 'coverPrompt', 'pages'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating storyline:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate storyline',
    });
  }
});

// Endpoint: Generate high quality coloring page image using gemini-3-pro-image-preview
// Supports imageSize ("1K", "2K", "4K") and aspectRatio
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      imageSize = '1K',
      aspectRatio = '3:4',
      isCover = false,
      childName = '',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Enforce coloring book specifications
    const coloringPrefix = isCover
      ? `Children's coloring book cover illustration featuring "${childName || 'Child'}", bold thick black outline art, pure white background, whimsical framing, uncolored, zero grayscale, zero shading, high-contrast crisp line work, printable coloring sheet`
      : `Children's coloring book page, crisp thick black line art on pure clean white background, zero color, zero grayscale, zero shading, uncolored, wide open coloring spaces, high contrast, clean vector style, printable coloring page`;

    const fullPrompt = `${coloringPrefix}: ${prompt}. Clean empty white background, thick black contour lines suitable for kids coloring with crayons.`;

    const validSizes = ['1K', '2K', '4K'];
    const selectedSize = validSizes.includes(imageSize) ? imageSize : '1K';

    const validRatios = ['3:4', '1:1', '4:3', '9:16', '16:9'];
    const selectedRatio = validRatios.includes(aspectRatio) ? aspectRatio : '3:4';

    let imageUrl: string | null = null;
    let usedModel = 'gemini-3-pro-image-preview';

    // Try with gemini-3-pro-image-preview first
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedRatio,
            imageSize: selectedSize,
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (primaryError: any) {
      console.warn('gemini-3-pro-image-preview call failed or quota restricted, falling back to gemini-3.1-flash-lite-image:', primaryError?.message);
      usedModel = 'gemini-3.1-flash-lite-image';

      // Graceful fallback to fast image model
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedRatio,
          },
        },
      });

      const parts = fallbackResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error('No image was returned from the model');
    }

    return res.json({
      imageUrl,
      modelUsed: usedModel,
      resolution: selectedSize,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate coloring page image',
    });
  }
});

// Endpoint: Multi-turn Chatbot (Pip the Coloring Pal)
// Supports gemini-3.8-flash (default), gemini-4-argon (complex), gemini-3.1-flash-lite (fast)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], model = 'gemini-3.8-flash', context = {} } = req.body;

    const allowedModels = ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-3.1-flash-lite'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

    const systemInstruction = `You are "Pip", a warm, enthusiastic, and creative AI director for children's coloring books!
Your role:
1. Help parents and children brainstorm one-of-a-kind coloring book themes (e.g., "Safari Submarine", "Cupcake Kingdom", "Space Dinosaurs").
2. Help develop fun 5-page story arcs where each page is an adventure.
3. Suggest coloring palettes, marker/crayon ideas, and creative coloring challenges for each page.
4. When suggesting themes, format them with [Theme: Your Theme Here] so the app UI can allow the user to click to apply immediately!
5. Current app context: Child Name: "${context.childName || 'Not set yet'}", Current Theme: "${context.theme || 'Not set yet'}".
Keep your answers vibrant, supportive, and formatted cleanly with friendly bullet points or short paragraphs.`;

    // Format contents for multi-turn chat
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || 'I love coloring! What theme should we explore together next?';

    // Extract any [Theme: ...] tags for suggestion buttons in UI
    const themeMatches = [...replyText.matchAll(/\[Theme:\s*([^\]]+)\]/gi)].map(m => m[1].trim());

    return res.json({
      reply: replyText,
      suggestedThemes: themeMatches,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return res.status(500).json({
      error: error.message || 'Chat assistant could not respond',
    });
  }
});

// Mount Vite or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
