import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const schedules = await (prisma as any).mealPlanSchedule.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { dayOfWeek, energyLevel, daysAhead, profileIds } = await req.json();

  const schedule = await (prisma as any).mealPlanSchedule.create({
    data: {
      userId: (session.user as any).id,
      dayOfWeek: Number(dayOfWeek),
      energyLevel: energyLevel || "Medium",
      daysAhead: Number(daysAhead) || 7,
      profileIds: JSON.stringify(profileIds || []),
      active: true
    }
  });

  return NextResponse.json(schedule);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  const data = await req.json();

  const schedule = await (prisma as any).mealPlanSchedule.update({
    where: { id, userId: (session.user as any).id },
    data
  });

  return NextResponse.json(schedule);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  await (prisma as any).mealPlanSchedule.delete({
    where: { id, userId: (session.user as any).id }
  });

  return new NextResponse("Deleted", { status: 200 });
}
