import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  
  const recipes = await prisma.recipe.findMany({ 
    where: { userId: (session.user as any).id },  
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { title, energyLevel, ingredients, miseEnPlace, instructions } = await req.json();
  
  const recipe = await prisma.recipe.create({
    data: {
      userId: (session.user as any).id,
      title,
      energyLevel,
      ingredients: JSON.stringify(ingredients),
      miseEnPlace: JSON.stringify(miseEnPlace),
      instructions: JSON.stringify(instructions)
    }
  });
  return NextResponse.json(recipe);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  await prisma.recipe.delete({
    where: { id, userId: (session.user as any).id }
  });
  return new NextResponse("Deleted", { status: 200 });
}
