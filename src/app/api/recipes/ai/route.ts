import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    // In local development, if you don't have GEMINI_API_KEY, 
    // it will throw an error. Make sure to add it to .env.
    if (!apiKey) {
      return new NextResponse("Gemini API key is missing from the environment", { status: 500 });
    }
    
    // In recent Node versions, @google/genai uses the native fetch block
    const ai = new GoogleGenAI({ apiKey });
    
    const sysInstruction = `You are a professional culinary AI assistant. The user wants a recipe based on their prompt. You MUST return pure valid JSON without markdown wrapping. It MUST strictly follow this interface:
{
  "title": "Recipe Title string",
  "energyLevel": "Low" | "Medium" | "High",
  "ingredients": [ { "name": "Chicken Breast", "amount": "2", "unit": "lbs" } ],
  "miseEnPlace": ["Chop the onions into small cubes", "Marinate the chicken for 10 mins"],
  "instructions": ["Heat the pan over medium heat", "Sear chicken until golden"]
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            systemInstruction: sysInstruction, 
            responseMimeType: "application/json" 
        }
    });

    if (!response.text) {
        throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Gen Error:", error);
    return new NextResponse(error.message || "Failed to generate recipe", { status: 500 });
  }
}
