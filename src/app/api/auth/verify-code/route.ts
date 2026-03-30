import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return new NextResponse("Missing fields", { status: 400 });

    const emailCode = await (prisma as any).emailCode.findFirst({
      where: { email, code },
      orderBy: { createdAt: "desc" }
    });

    if (!emailCode) return new NextResponse("Invalid code", { status: 400 });
    if (new Date() > new Date(emailCode.expiresAt)) {
      await (prisma as any).emailCode.delete({ where: { id: emailCode.id } });
      return new NextResponse("Code has expired", { status: 400 });
    }

    // Clean up code
    await (prisma as any).emailCode.deleteMany({ where: { email } });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, passwordHash: "" }
      });
    }

    return NextResponse.json({ verified: true, email: user.email });
  } catch (error: any) {
    console.error("Verify code error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
