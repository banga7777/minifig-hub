
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabaseClient";

export interface ScanResult {
  item_no: string;
  name: string;
  confidence: number;
  reasoning: string;
}

export const geminiService = {
  identifyWithVector: async (base64Image: string): Promise<ScanResult | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
      // Step 1: Visual Feature Extraction
      const visionResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Analyze this LEGO minifigure and describe its visual identity in detail for a vector database search. Include: specific torso print patterns, headgear (hair/helmet) shape and color, facial expressions, and any unique identifiers. Be objective and descriptive." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        },
        config: {
          temperature: 0.1, 
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const visualDescription = visionResponse.text;
      if (!visualDescription) throw new Error("FEATURE_EXTRACTION_FAILED");

      // Step 2: Convert to Vector (Embedding)
      // [FIX]: Reverted to embedContent as batchEmbedContents is not available on ai.models
      const embeddingResult = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: { parts: [{ text: visualDescription }] },
        config: {
          taskType: 'RETRIEVAL_QUERY'
        }
      });

      const embedding = embeddingResult.embeddings?.[0];
      if (!embedding || !embedding.values) {
        throw new Error("EMBEDDING_GENERATION_FAILED");
      }

      const vector = embedding.values;

      // Step 3: Global Vector Similarity Search (Supabase RPC)
      const { data: matches, error: searchError } = await supabase.rpc('match_minifigures', {
        query_embedding: vector,
        match_threshold: 0.25, 
        match_count: 5
      });

      if (searchError) {
        console.error("Vector Search DB Error:", searchError);
        throw new Error("DATABASE_SEARCH_ERROR");
      }

      if (!matches || matches.length === 0) {
        return null;
      }

      const topMatch = matches[0];
      return {
        item_no: topMatch.item_no,
        name: topMatch.name_en || "Unknown Character",
        confidence: topMatch.similarity,
        reasoning: `Vector search matched this figure with ${(topMatch.similarity * 100).toFixed(1)}% confidence based on visual signature.`
      };

    } catch (err: any) {
      if (err?.message?.includes('429')) {
        throw new Error("QUOTA_EXCEEDED");
      }
      console.error("Vector Pipeline Error:", err);
      return null;
    }
  },

  identifyMinifigure: async (base64Image: string): Promise<ScanResult | null> => {
    return geminiService.identifyWithVector(base64Image);
  }
};
