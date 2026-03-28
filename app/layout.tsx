import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YT Ad Summarizer",
  description: "Resumen de videos de YouTube enfocado en ADs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
