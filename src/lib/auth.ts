import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
const COOKIE_PATH = "/focus-group";

function getSecret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "focusgroup2026";
}

function signToken(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(payload);
  return hmac.digest("hex");
}

function createToken(userId: string, email: string): string {
  const payload = `${userId}:${email}:${Date.now()}`;
  const sig = signToken(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 4) return null;
    const sig = parts.pop()!;
    const payload = parts.join(":");
    const expected = signToken(payload);
    if (sig !== expected) return null;
    return { userId: parts[0], email: parts[1] };
  } catch {
    return null;
  }
}

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const token = createToken(user.id, user.email);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: COOKIE_PATH,
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete({ name: COOKIE_NAME, path: COOKIE_PATH });
}

export async function getCurrentAdmin() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const parsed = verifyToken(token);
  if (!parsed) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: parsed.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

export async function requireOwner() {
  const admin = await requireAdmin();
  if (admin.role !== "OWNER") throw new Error("Forbidden");
  return admin;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Legacy compat — keep old admin-auth working during transition
export { isAdminAuthenticated as isAdminAuth };
