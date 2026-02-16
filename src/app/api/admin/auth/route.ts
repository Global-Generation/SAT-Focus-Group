import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, setAdminCookie } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || !(await verifyAdminPassword(password))) {
      return NextResponse.json(
        { error: "Неверный пароль" },
        { status: 401 }
      );
    }

    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Ошибка авторизации" },
      { status: 500 }
    );
  }
}
