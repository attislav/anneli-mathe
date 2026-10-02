import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sternenpfad",
  description: "Mathe-Abenteuer für die 2. Klasse — Sterne sammeln, Welten entdecken.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Sternenpfad", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7b4dff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full font-sans font-bold">{children}</body>
    </html>
  );
}
