import { NextRequest, NextResponse } from "next/server";
import { requireOwner, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/[id] — update admin
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireOwner();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email.toLowerCase();
  if (body.role) data.role = body.role;
  if (body.password) data.passwordHash = await hashPassword(body.password);

  const user = await prisma.adminUser.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

// DELETE /api/admin/users/[id] — delete admin
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await requireOwner();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  // Cannot delete yourself
  if (admin.id === id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 }
    );
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
