"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Loader2,
  LayoutDashboard,
  Users,
  LogOut,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "EDITOR";
};

/* ── Animated blob background ── */
function AnimatedBlobs() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="blob blob-hero-center" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-5" />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/focus-group/api/admin/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data || null))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/focus-group/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ошибка авторизации");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/focus-group/api/admin/auth/logout", { method: "POST" });
    setUser(null);
  };

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
        <AnimatedBlobs />

        <div className="relative z-10 w-full max-w-sm">
          <div className="glass-form animate-fade-scale p-7 sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/80 backdrop-blur-sm">
                <Lock className="h-7 w-7 text-blue-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">GG Surveys</h1>
              <p className="mt-1 text-sm text-slate-500">Войдите в админ-панель</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-medium text-slate-600">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="mt-1.5 rounded-xl border-slate-200/80 bg-white/70 backdrop-blur-sm"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-xs font-medium text-slate-600">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="mt-1.5 rounded-xl border-slate-200/80 bg-white/70 backdrop-blur-sm"
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200/80 bg-red-50/80 p-3 text-center text-sm text-red-600 backdrop-blur-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="btn-cta mt-2 w-full disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Войти
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "Опросы", icon: ClipboardList, exact: true },
    ...(user.role === "OWNER"
      ? [{ href: "/admin/users", label: "Пользователи", icon: Users, exact: true }]
      : []),
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-dvh bg-[#f8fafc]">
      {/* Sidebar — dark */}
      <aside className="fixed left-0 top-0 z-30 flex h-full w-56 flex-col bg-slate-900">
        <div className="flex h-14 items-center gap-2.5 border-b border-white/10 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <LayoutDashboard className="h-4 w-4 text-blue-400" />
          </div>
          <span className="font-semibold text-sm text-white">GG Surveys</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive(item.href, item.exact)
                  ? "bg-white/10 text-white font-medium shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-3 text-xs text-slate-500 truncate">
            {user.name}
            <span className="ml-1 text-slate-600">({user.role})</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-all hover:bg-white/5 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
