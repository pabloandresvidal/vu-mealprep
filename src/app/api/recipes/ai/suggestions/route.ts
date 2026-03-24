import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { prompt } = await req.json();

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

    const systemPrompt = `You are a world-class culinary AI assistant connected to the internet's knowledge of highly-rated recipes.
Based on the user's prompt (or if empty, just surprise them), suggest exactly THREE highly-rated, popular recipes.
Return ONLY a valid JSON array of objects. Do not include markdown formatting or backticks.
Each object must match this schema:
{
  "title": "String - Recipe Name",
  "description": "String - Short 1-sentence appetizing description",
  "prepTime": "String - e.g. 30 mins",
  "servings": Number - e.g. 2,
  "energyLevel": "String - Low, Medium, or High"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt || "Suggest 3 random delicious and highly rated dinner recipes.",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    let rawText = response.text || "[]";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const suggestions = JSON.parse(rawText);
    return NextResponse.json(suggestions);

  } catch (error: any) {
    console.error("AI Suggestions Error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
