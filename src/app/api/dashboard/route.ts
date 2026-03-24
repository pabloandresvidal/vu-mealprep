import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  
  const userId = (session.user as any).id;
  const recipeCount = await prisma.recipe.count({ where: { userId } });
  const profileCount = await prisma.familyProfile.count({ where: { userId } });
  const activePlansCount = await prisma.mealPlan.count({ where: { userId } });

  return NextResponse.json({
      recipeCount,
      profileCount,
      activePlansCount
  });
}
