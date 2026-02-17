import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both legacy (password-only) and new (email+password) login
    const email = body.email;
    const password = body.password;

    if (!password) {
      return NextResponse.json(
        { error: "Введите пароль" },
        { status: 400 }
      );
    }

    // If no email provided, this is a legacy login — try with default admin email
    const loginEmail = email || process.env.ADMIN_EMAIL || "admin@gg.ru";

    const user = await loginAdmin(loginEmail, password);
    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json(
      { error: "Ошибка авторизации" },
      { status: 500 }
    );
  }
}
