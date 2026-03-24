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
     const plan = await prisma.mealPlan.findUnique({ where: { id, userId: (session.user as any).id } });
     if (!plan) return new NextResponse("Not Found", { status: 404 });
     return NextResponse.json(plan);
  }

  const plans = await prisma.mealPlan.findMany({ 
      where: { userId: (session.user as any).id }, 
      orderBy: { startDate: "desc" } 
  });
  return NextResponse.json(plans);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  await prisma.mealPlan.delete({ where: { id, userId: (session.user as any).id } });
  return new NextResponse("Deleted", { status: 200 });
}
