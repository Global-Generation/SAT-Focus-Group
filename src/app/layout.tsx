import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAT Фокус-группа — Анкета участника",
  description:
    "Примите участие в фокус-группе SAT-платформы и помогите улучшить продукт",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
