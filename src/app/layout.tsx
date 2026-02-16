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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="min-h-screen min-h-dvh bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
