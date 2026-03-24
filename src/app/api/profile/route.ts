import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const profiles = await prisma.familyProfile.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(profiles);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { name, objective, dietaryRestrictions, age, gender } = await req.json();
  if (!name || !objective) return new NextResponse("Missing Fields", { status: 400 });

  const profile = await prisma.familyProfile.create({
    data: {
      userId: (session.user as any).id,
      name,
      objective,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      dietaryRestrictions: dietaryRestrictions || null
    }
  });
  return NextResponse.json(profile);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  await prisma.familyProfile.delete({
    where: { id, userId: (session.user as any).id }
  });
  return new NextResponse("Deleted", { status: 200 });
}
