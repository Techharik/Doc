import { GoogleGenAI } from "@google/genai";
import { ProcessedFile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDocumentSummary = async (processedFile: ProcessedFile): Promise<string> => {
  const modelId = 'gemini-2.5-flash';
  
  const systemInstruction = `
    You are an expert document analyst and summarizer. 
    Your goal is to provide clear, structured, and actionable summaries of documents.
    
    Format your response in Markdown with the following structure:
    1. **Executive Summary**: A 2-3 sentence high-level overview.
    2. **Key Points**: A bulleted list of the most important facts or arguments.
    3. **Detailed Analysis**: A deeper dive into specific sections if applicable.
    4. **Action Items / Conclusion**: Any required actions or final takeaways.
    
    Keep the tone professional and objective.
  `;

  try {
    let contents;

    if (processedFile.type === 'pdf' && processedFile.base64) {
      // Native PDF support via inlineData
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: processedFile.base64
            }
          },
          {
            text: "Please summarize this PDF document."
          }
        ]
      };
    } else if (processedFile.type === 'word' && processedFile.content) {
      // Word documents are sent as extracted text
      contents = {
        parts: [
          {
            text: `Please summarize the following document content:\n\n${processedFile.content}`
          }
        ]
      };
    } else {
      throw new Error("Invalid file data for processing.");
    }

    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for more factual summaries
      },
      contents: contents,
    });

    return response.text || "No summary generated.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};