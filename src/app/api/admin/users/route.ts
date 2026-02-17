import { NextRequest, NextResponse } from "next/server";
import { requireOwner, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users — list admins (OWNER only)
export async function GET() {
  const admin = await requireOwner();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json({ users });
}

// POST /api/admin/users — create admin
export async function POST(req: NextRequest) {
  const admin = await requireOwner();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, name, role } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, password, and name are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 409 }
    );
  }

  const user = await prisma.adminUser.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      name,
      role: role === "OWNER" ? "OWNER" : "EDITOR",
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
