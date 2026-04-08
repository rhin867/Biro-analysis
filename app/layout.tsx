import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Biro-Analysis | JEE & NEET Test Intelligence Platform",
  description:
    "Revolutionary AI-powered test analysis engine for JEE and NEET aspirants. Track 50+ behavioral metrics, detect hesitation patterns, blunders, and generate personalized action plans.",
  keywords: "JEE analysis, NEET analysis, test tracker, behavioral analysis, study plan",
  authors: [{ name: "Biro-Analysis" }],
  openGraph: {
    title: "Biro-Analysis",
    description: "The most advanced JEE/NEET test analysis platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#0F172A] text-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
