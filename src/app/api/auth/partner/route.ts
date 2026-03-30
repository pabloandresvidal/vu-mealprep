import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET: get current partner info
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) return new NextResponse("Not found", { status: 404 });

  let partner = null;
  if (user.partnerId) {
    partner = await prisma.user.findUnique({ where: { id: user.partnerId }, select: { id: true, email: true } });
  }

  return NextResponse.json({ partnerId: user.partnerId, partner });
}

// POST: invite a partner by email
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { email } = await req.json();
  if (!email) return new NextResponse("Email required", { status: 400 });

  const currentUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!currentUser) return new NextResponse("Not found", { status: 404 });
  if (email === currentUser.email) return new NextResponse("Cannot link to yourself", { status: 400 });

  const partnerUser = await prisma.user.findUnique({ where: { email } });
  if (!partnerUser) return new NextResponse("No account found with that email", { status: 404 });

  // Link both users
  await prisma.user.update({ where: { id: currentUser.id }, data: { partnerId: partnerUser.id } });
  await prisma.user.update({ where: { id: partnerUser.id }, data: { partnerId: currentUser.id } });

  await sendEmail({
    to: email,
    subject: "You've been linked on PrepMaster!",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
        <h2 style="color: #145346;">🍳 PrepMaster</h2>
        <p><strong>${currentUser.email}</strong> has linked their account with yours.</p>
        <p>You now share recipes, meal plans, and family profiles.</p>
      </div>
    `
  });

  return NextResponse.json({ message: "Partner linked successfully" });
}

// DELETE: unlink partner
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user || !user.partnerId) return new NextResponse("No partner linked", { status: 400 });

  // Unlink both sides
  await prisma.user.update({ where: { id: user.partnerId }, data: { partnerId: null } });
  await prisma.user.update({ where: { id: user.id }, data: { partnerId: null } });

  return NextResponse.json({ message: "Partner unlinked" });
}
