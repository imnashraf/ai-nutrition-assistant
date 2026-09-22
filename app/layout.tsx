import type { Metadata } from "next";
import "./globals.css";

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
              <span className="material-symbols-outlined text-[18px]">eco</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-headline-md text-lg tracking-tight text-on-surface font-bold leading-none">NutriAI</span>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full flex bg-surface">
          {children}
        </main>
      </body>
    </html>
  );
}
