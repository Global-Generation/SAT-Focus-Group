import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GG Surveys — Опросы Global Generation",
  description:
    "Примите участие в опросе и помогите улучшить образовательные продукты",
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
      <body className="min-h-screen min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
