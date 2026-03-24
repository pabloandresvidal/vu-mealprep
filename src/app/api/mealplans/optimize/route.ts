import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    const { planId } = await req.json();

    const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan) return new NextResponse("Not Found", { status: 404 });
    if (plan.generatedPlan) return NextResponse.json(JSON.parse(plan.generatedPlan));

    const recipeRefs = JSON.parse(plan.recipeRefs);
    const uniqueRecipeIds = Array.from(new Set<string>(recipeRefs.map((r: any) => r.recipeId)));
    
    // Fetch recipes to give context
    const recipes = await prisma.recipe.findMany({ where: { id: { in: uniqueRecipeIds } } });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return new NextResponse("No Gemini API Key", { status: 500 });
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a culinary prep optimization AI. I have a multi-day meal plan for ${plan.numPeople} people involving the following recipes:
${JSON.stringify(recipes.map((r: any) => ({ ...r, ingredients: JSON.parse(r.ingredients) })), null, 2)}

Your task is to combine all the requirements from these recipes into one seamless unified Meal Prep plan for Sunday.
IMPORTANT: Each recipe above has a "servings" field (base yield). You MUST scale all ingredients proportionally so they are sufficient for ${plan.numPeople} people.

1. Combine all ingredients from all recipes into a single aggregated SHOPPING LIST, scaled for ${plan.numPeople} people.
2. Unify all mise en place steps into a chronologically efficient "Prep in one go" workflow.
3. Consolidate cooking instructions into streamline components.

You MUST output strictly valid JSON adhering to this interface:
{
  "shoppingList": [ { "item": "Chicken Breast", "combinedAmount": "scaled amount e.g. 4 lbs" } ],
  "unifiedMiseEnPlace": [ "Chop all onions at once (6 onions total)", "Marinate chicken in 2 batches" ],
  "unifiedInstructions": [ "When ready to eat dish A, sear the chicken", "When ready for dish B, simmer the sauce" ]
}`;

    const resData = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: prompt, 
        config: { responseMimeType: "application/json" } 
    });
    
    if(!resData.text) throw new Error("No optimization returned");
    const generatedJson = JSON.parse(resData.text);

    await prisma.mealPlan.update({ where: { id: planId }, data: { generatedPlan: JSON.stringify(generatedJson) } });
    return NextResponse.json(generatedJson);
  } catch (error: any) {
    console.error("Optimization Gen Error:", error);
    return new NextResponse(error.message || "Failed to generate optimized plan", { status: 500 });
  }
}
