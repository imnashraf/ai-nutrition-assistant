import type { Metadata } from "next";
import "./globals.css";
import NutriAILogo from "@/components/NutriAILogo";
export const metadata: Metadata = {
  title: "NutriAI Assistant",
  description: "Evidence-backed consumer nutrition assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
        <header className="w-full h-16 bg-surface-container/90 backdrop-blur-md border-b border-outline-variant flex items-center px-4 md:px-8 z-50 sticky top-0">
          <NutriAILogo variant="compact" />
        </header>
        <main className="flex-1 w-full flex bg-surface">
          {children}
        </main>
      </body>
    </html>
  );
}
