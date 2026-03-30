import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const recipe = await prisma.recipe.findUnique({ where: { id, userId: (session.user as any).id } });
    if (!recipe) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(recipe);
  }

  const recipes = await prisma.recipe.findMany({ 
    where: { userId: (session.user as any).id },  
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { title, energyLevel, servings, ingredients, miseEnPlace, instructions } = await req.json();
  
  const recipe = await (prisma.recipe as any).create({
    data: {
      userId: (session.user as any).id,
      title,
      energyLevel,
      servings: Number(servings) || 2,
      ingredients: JSON.stringify(ingredients),
      miseEnPlace: JSON.stringify(miseEnPlace),
      instructions: JSON.stringify(instructions)
    }
  });
  return NextResponse.json(recipe);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id, title, energyLevel, servings, ingredients, miseEnPlace, instructions } = await req.json();
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  const recipe = await (prisma.recipe as any).update({
    where: { id, userId: (session.user as any).id },
    data: {
      title,
      energyLevel,
      servings: Number(servings) || 2,
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
