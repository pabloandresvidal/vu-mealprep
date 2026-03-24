import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new NextResponse("Missing Info", { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash: hashedPassword }
    });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error: any) {
    console.error("🟢 FATAL REGISTER ERROR:", error);
    if (error.code === 'P2002') return new NextResponse("Email already exists", { status: 400 });
    return NextResponse.json({ error: "Internal Error", details: error.message || String(error) }, { status: 500 });
  }
}
