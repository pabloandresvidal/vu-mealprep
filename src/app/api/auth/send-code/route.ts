import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return new NextResponse("Email required", { status: 400 });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old codes
    await (prisma as any).emailCode.deleteMany({ where: { email } });

    // Save code
    await (prisma as any).emailCode.create({
      data: { email, code, expiresAt }
    });

    await sendEmail({
      to: email,
      subject: "Your PrepMaster login code",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #145346;">🍳 PrepMaster</h2>
          <p>Your one-time login code is:</p>
          <div style="font-size: 2.5rem; font-weight: 800; color: #145346; background: #f0fdf4; padding: 1rem 2rem; border-radius: 12px; text-align: center; letter-spacing: 8px; margin: 1rem 0;">${code}</div>
          <p style="color: #64748b; font-size: 0.85rem;">This code expires in 10 minutes.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "Code sent" });
  } catch (error: any) {
    console.error("Send code error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
