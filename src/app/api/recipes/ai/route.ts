import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { title, description, servings, energyLevel } = await req.json();
    if (!title) return new NextResponse("Missing title", { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return new NextResponse("No API Key", { status: 500 });

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `You are an expert culinary AI. I have selected the recipe "${title}". 
Description: ${description}
Energy Level: ${energyLevel}
Servings: ${servings}

Please generate the DETAILED rigorous data needed to cook this.
Return ONLY valid JSON. No markdown wrappers.
Schema:
{
  "ingredients": [ { "item": "string", "amount": "string e.g. 2 cups" } ],
  "miseEnPlace": [ "string - sequence of prep steps" ],
  "instructions": [ "string - sequence of cooking steps" ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: { temperature: 0.2 }
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const generated = JSON.parse(rawText);

    const recipe = await (prisma.recipe as any).create({
      data: {
        userId: session.user.id,
        title: title,
        servings: Number(servings) || 2,
        energyLevel: energyLevel || "Medium",
        ingredients: JSON.stringify(generated.ingredients || []),
        miseEnPlace: JSON.stringify(generated.miseEnPlace || []),
        instructions: JSON.stringify(generated.instructions || [])
      }
    });

    return NextResponse.json({ id: recipe.id });
  } catch (error: any) {
    console.error("AI Gen Error:", error);
    return new NextResponse(error.message || "Failed to generate recipe", { status: 500 });
  }
}
