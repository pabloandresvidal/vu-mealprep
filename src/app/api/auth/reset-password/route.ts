import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return new NextResponse("Missing fields", { status: 400 });
    if (password.length < 6) return new NextResponse("Password must be at least 6 characters", { status: 400 });

    const resetToken = await (prisma as any).passwordResetToken.findUnique({ where: { token } });
    if (!resetToken) return new NextResponse("Invalid or expired token", { status: 400 });
    if (new Date() > new Date(resetToken.expiresAt)) {
      await (prisma as any).passwordResetToken.delete({ where: { id: resetToken.id } });
      return new NextResponse("Token has expired", { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash }
    });

    // Clean up token
    await (prisma as any).passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
