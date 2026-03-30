import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return new NextResponse("Email required", { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Delete old tokens for this email
    await (prisma as any).passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await (prisma as any).passwordResetToken.create({
      data: { email, token, expiresAt }
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your PrepMaster password",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #145346;">🍳 PrepMaster</h2>
          <p>You requested a password reset. Click the link below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 0.8rem 2rem; background: #145346; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 1rem 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 0.85rem;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
