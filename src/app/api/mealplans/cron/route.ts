import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint is called by a cron job (e.g., daily via pm2/systemd/external cron)
// It checks all active schedules and generates plans for those whose dayOfWeek matches today
export async function POST(req: Request) {
  try {
    // Simple auth via secret header to protect the cron endpoint
    const authHeader = req.headers.get("x-cron-secret");
    if (authHeader !== process.env.NEXTAUTH_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const today = new Date();
    const todayDow = today.getDay(); // 0=Sun, 6=Sat

    const dueSchedules = await (prisma as any).mealPlanSchedule.findMany({
      where: { active: true, dayOfWeek: todayDow }
    });

    if (dueSchedules.length === 0) {
      return NextResponse.json({ message: "No schedules due today", generated: 0 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return new NextResponse("No API Key", { status: 500 });
    const ai = new GoogleGenAI({ apiKey });

    let generated = 0;

    for (const sched of dueSchedules) {
      try {
        // Skip if already ran today
        if (sched.lastRun) {
          const lastRun = new Date(sched.lastRun);
          if (lastRun.toDateString() === today.toDateString()) continue;
        }

        const profileIds = JSON.parse(sched.profileIds);
        const profiles = await prisma.familyProfile.findMany({ where: { id: { in: profileIds } } });
        const recipes = await prisma.recipe.findMany({ where: { userId: sched.userId } });

        if (recipes.length === 0) continue;

        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() + 1); // Start tomorrow
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + sched.daysAhead - 1);

        const prompt = `You are an expert AI meal planner. Generate a meal plan from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}.
Target Energy Level: ${sched.energyLevel}
Number of people: ${profileIds.length || 2}
Family Members:
${JSON.stringify(profiles.map((p: any) => ({ name: p.name, age: p.age, gender: p.gender, objective: p.objective, dietaryRestrictions: p.dietaryRestrictions })), null, 2)}

Available Recipes:
${JSON.stringify(recipes.map((r: any) => ({ id: r.id, title: r.title, energyLevel: r.energyLevel, servings: r.servings })), null, 2)}

Select recipes that best fit the family. Output ONLY valid JSON:
{
  "plan": [
    { "date": "YYYY-MM-DD", "meal": "Dinner", "recipeId": "string-id", "reason": "brief reason" }
  ]
}`;

        const resData = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        if (!resData.text) continue;
        const generatedJson = JSON.parse(resData.text);

        await (prisma.mealPlan as any).create({
          data: {
            userId: sched.userId,
            startDate: startDate,
            endDate: endDate,
            energyLevel: sched.energyLevel,
            numPeople: profileIds.length || 2,
            profiles: JSON.stringify(profiles),
            recipeRefs: JSON.stringify(generatedJson.plan)
          }
        });

        // Update lastRun
        await (prisma as any).mealPlanSchedule.update({
          where: { id: sched.id },
          data: { lastRun: new Date() }
        });

        generated++;
      } catch (err) {
        console.error(`Schedule ${sched.id} failed:`, err);
      }
    }

    return NextResponse.json({ message: `Generated ${generated} plans`, generated });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return new NextResponse(error.message || "Cron failed", { status: 500 });
  }
}
