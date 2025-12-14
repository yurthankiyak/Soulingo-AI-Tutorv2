import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import {
  GEMINI_FLASH_MODEL,
  GEMINI_FLASH_IMAGE_MODEL,
  SOULINGO_VISION_SYSTEM_INSTRUCTION, // Changed from SUOLINGO_VISION_SYSTEM_INSTRUCTION
  SOULINGO_GRAMMAR_SYSTEM_INSTRUCTION, // Changed from SUOLINGO_GRAMMAR_SYSTEM_INSTRUCTION
  SOULINGO_CHAT_SYSTEM_INSTRUCTION, // Changed from SUOLINGO_CHAT_SYSTEM_INSTRUCTION
  // Fix: Moved VISION_RESPONSE_PARSING_REGEX import from types to constants
  VISION_RESPONSE_PARSING_REGEX,
} from '../constants';
import { ImageFile, Message, MessageSender, MessageType, ImageAnalysisContent, TextContent } from '../types';

/**
 * Parses the model's vision response to extract identified objects, their Turkish translations,
 * and example sentences.
 * @param responseText The raw text response from the Gemini Vision model.
 * @returns An array of identified objects or null if parsing fails.
 */
function parseVisionResponse(responseText: string): ImageAnalysisContent["identifiedObjects"] | null {
  const matches = [...responseText.matchAll(VISION_RESPONSE_PARSING_REGEX)];
  if (matches.length === 0) {
    console.warn("Could not parse vision response with regex:", responseText);
    return null;
  }

  return matches.map(match => ({
    english: match[1].trim(),
    turkish: match[2].trim(),
    sentence: match[3].trim(),
  }));
}

export const geminiService = {
  /**
   * Initializes the GoogleGenAI client.
   * CRITICAL: Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
   */
  getGeminiClient: () => {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not defined. Please ensure it's set in your environment.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  },

  /**
   * Analyzes an uploaded image to identify objects, provide Turkish translations, and example sentences.
   * @param imageFile The uploaded image data.
   * @param userPrompt An optional user prompt accompanying the image.
   * @returns A parsed ImageAnalysisContent object.
   */
  analyzeImage: async (imageFile: ImageFile, userPrompt?: string): Promise<ImageAnalysisContent> => {
    const ai = geminiService.getGeminiClient();
    const contents: Part[] = [
      {
        inlineData: {
          mimeType: imageFile.mimeType,
          data: imageFile.base64,
        },
      },
      {
        text: userPrompt || "Analyze the objects in this image and provide English names, Turkish translations, and sophisticated example sentences.",
      },
    ];

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_FLASH_IMAGE_MODEL,
        contents: { parts: contents },
        config: {
          systemInstruction: SOULINGO_VISION_SYSTEM_INSTRUCTION, // Changed from SUOLINGO_VISION_SYSTEM_INSTRUCTION
        },
      });

      const responseText = response.text || '';
      const identifiedObjects = parseVisionResponse(responseText);

      if (!identifiedObjects || identifiedObjects.length === 0) {
        throw new Error("No identifiable objects or malformed response from vision model.");
      }

      return {
        imagePrompt: userPrompt || 'Resim analizi',
        identifiedObjects: identifiedObjects,
      };
    } catch (error) {
      console.error("Error analyzing image with Gemini Vision API:", error);
      throw new Error("Resmi analiz ederken bir sorun oluştu. Lütfen tekrar deneyin.");
    }
  },

  /**
   * Checks the grammar of an English sentence and provides corrections or affirmations.
   * @param userSentence The English sentence to check.
   * @returns The model's response for grammar correction.
   */
  checkGrammar: async (userSentence: string): Promise<string> => {
    const ai = geminiService.getGeminiClient();
    const prompt = `User sentence: '${userSentence}'`;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_FLASH_MODEL,
        contents: prompt,
        config: {
          systemInstruction: SOULINGO_GRAMMAR_SYSTEM_INSTRUCTION, // Changed from SUOLINGO_GRAMMAR_SYSTEM_INSTRUCTION
        },
      });
      return response.text || "Üzgünüm, cümle analizi yapılamadı.";
    } catch (error) {
      console.error("Error checking grammar with Gemini API:", error);
      throw new Error("Dilbilgisini kontrol ederken bir sorun oluştu. Lütfen tekrar deneyin.");
    }
  },

  /**
   * Engages in general chat with the Soulingo tutor.
   * @param chatHistory The current chat history.
   * @param newMessage The new message from the user.
   * @returns The model's chat response.
   */
  chat: async (chatHistory: Message[], newMessage: string): Promise<string> => {
    const ai = geminiService.getGeminiClient();

    // Reconstructing history for chat.sendMessage, making sure it alternates roles
    const formattedHistory = [];
    for (const msg of chatHistory) {
      if (msg.type === MessageType.Text || msg.type === MessageType.GrammarCorrection) { // Only text messages for chat history
        formattedHistory.push({
          message: (msg.content as TextContent).text,
          author: msg.sender === MessageSender.User ? 'user' : 'model',
        });
      }
    }

    try {
      const chatInstance = ai.chats.create({
        model: GEMINI_FLASH_MODEL,
        config: {
          systemInstruction: SOULINGO_CHAT_SYSTEM_INSTRUCTION, // Changed from SUOLINGO_CHAT_SYSTEM_INSTRUCTION
        },
        history: formattedHistory.map(entry => ({
            role: entry.author,
            parts: [{ text: entry.message }]
        }))
      });

      const chatResponse = await chatInstance.sendMessage({ message: newMessage });
      return chatResponse.text || "Üzgünüm, yanıt verilemedi.";

    } catch (error) {
      console.error("Error chatting with Gemini API:", error);
      throw new Error("Sohbet ederken bir sorun oluştu. Lütfen tekrar deneyin.");
    }
  },
};