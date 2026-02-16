import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

export async function setAdminCookie() {
  const store = await cookies();
  const token = Buffer.from(
    `admin:${Date.now()}:${process.env.ADMIN_PASSWORD}`
  ).toString("base64");

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/focus-group",
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    return parts[0] === "admin" && parts[2] === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}
