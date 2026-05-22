import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AviaGuard 2026 – Savicol Audit Platform",
  description: "Plataforma de Auditoría y Control Interno – Savicol",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
