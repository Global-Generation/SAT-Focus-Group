"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "EDITOR";
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "EDITOR",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    const res = await fetch("/focus-group/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    if (editId) {
      const body: Record<string, string> = { name: form.name, role: form.role };
      if (form.email) body.email = form.email;
      if (form.password) body.password = form.password;

      const res = await fetch(`/focus-group/api/admin/users/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Ошибка");
        setSaving(false);
        return;
      }
    } else {
      if (!form.email || !form.password || !form.name) {
        setError("Заполните все поля");
        setSaving(false);
        return;
      }
      const res = await fetch("/focus-group/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Ошибка");
        setSaving(false);
        return;
      }
    }

    setShowForm(false);
    setEditId(null);
    setForm({ email: "", password: "", name: "", role: "EDITOR" });
    loadUsers();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить пользователя?")) return;
    await fetch(`/focus-group/api/admin/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  const startEdit = (u: AdminUser) => {
    setEditId(u.id);
    setForm({ email: u.email, password: "", name: u.name, role: u.role });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Пользователи</h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({ email: "", password: "", name: "", role: "EDITOR" });
          }}
          className="bg-primary text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> Добавить
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 p-4">
          <h3 className="mb-3 text-sm font-medium">
            {editId ? "Редактировать" : "Новый пользователь"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Имя</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">
                Пароль{editId ? " (оставьте пустым)" : ""}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Роль</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="EDITOR">Редактор</option>
                <option value="OWNER">Владелец</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-primary text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editId ? (
                "Сохранить"
              ) : (
                "Создать"
              )}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{u.name}</span>
                <Badge
                  className={
                    u.role === "OWNER"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {u.role}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => startEdit(u)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(u.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
