import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const { startDate, endDate, energyLevel, profileIds, numPeople, ingredientsOnHand } = await req.json();

    // Overlap Clash Detection
    const overlapping = await prisma.mealPlan.findFirst({
        where: {
            userId,
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
        }
    });

    if (overlapping && req.headers.get("x-override-clash") !== "true") {
        return NextResponse.json({ clash: true, existingPlanId: overlapping.id }, { status: 409 });
    }

    if (overlapping && req.headers.get("x-override-clash") === "true") {
        await prisma.mealPlan.delete({ where: { id: overlapping.id } });
    }

    // Fetch DB Context
    const allRecipes = await prisma.recipe.findMany({ where: { userId } });
    if (allRecipes.length === 0) return new NextResponse("No recipes in your DB to plan against.", { status: 400 });

    const profiles = await prisma.familyProfile.findMany({ where: { id: { in: profileIds } } });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return new NextResponse("Gemini API key is missing", { status: 500 });
    
    const ai = new GoogleGenAI({ apiKey });

    // Build the ingredients hint
    const ingredientsHint = ingredientsOnHand && ingredientsOnHand.length > 0
      ? `\nThe user has these ingredients on hand: ${ingredientsOnHand.join(", ")}.\nSTRONGLY PREFER recipes that use these ingredients to minimize waste and grocery trips.\n`
      : "";

    const prompt = `You are an expert AI meal planner. We need a meal plan from ${startDate} to ${endDate}.
Target Energy Level (cooking effort): ${energyLevel}
Number of people to cook for: ${numPeople}
Family Members to feed, their ages, gender, and objectives/restrictions:
${JSON.stringify(profiles.map((p: any) => ({ name: p.name, age: p.age, gender: p.gender, objective: p.objective, dietaryRestrictions: p.dietaryRestrictions })), null, 2)}
${ingredientsHint}
Available Recipes in Database:
${JSON.stringify(allRecipes.map((r: any) => ({ id: r.id, title: r.title, energyLevel: r.energyLevel, servings: r.servings })), null, 2)}

Select recipes from the available list that best fit the family's needs, energy level, and ages. Assign them to days.
Consider the ages of family members when planning — younger children may need simpler, milder foods while adults may enjoy more variety.
You MUST output valid JSON strictly adhering to this format:
{
  "plan": [
    { "date": "YYYY-MM-DD", "meal": "Dinner", "recipeId": "string-id-from-db", "reason": "brief explanation why this fits" }
  ]
}
`;

    const resData = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    if (!resData.text) throw new Error("No text returned from Gemini");
    
    const generatedJson = JSON.parse(resData.text);

    const savedPlan = await (prisma.mealPlan as any).create({
        data: {
            userId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            energyLevel,
            numPeople: Number(numPeople) || 2,
            profiles: JSON.stringify(profiles),
            recipeRefs: JSON.stringify(generatedJson.plan)
        }
    });

    return NextResponse.json(savedPlan);
  } catch (error: any) {
    console.error("Meal Plan Gen Error:", error);
    return new NextResponse(error.message || "Failed to generate plan", { status: 500 });
  }
}
