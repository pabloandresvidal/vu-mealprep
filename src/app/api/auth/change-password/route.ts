import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) return new NextResponse("Missing fields", { status: 400 });
    if (newPassword.length < 6) return new NextResponse("New password must be at least 6 characters", { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // If user has a password, verify current one
    if (user.passwordHash && user.passwordHash !== "") {
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) return new NextResponse("Current password is incorrect", { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { passwordHash }
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error: any) {
    console.error("Change password error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
