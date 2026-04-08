import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Biro-Analysis | Neural Exam Platform",
  description: "High-performance test intelligence for JEE/NEET aspirants. Level 4 Behavioral Metrics.",
  keywords: "JEE, NEET, Behavioral Analysis, Chronometrics",
  authors: [{ name: "Biro-Analysis" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth bg-[#020617]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-mono antialiased bg-[#020617] text-white`}>
        {/* Onboarding Zero-Data Logic */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              if (!localStorage.getItem('biro_init_v4')) {
                localStorage.clear();
                localStorage.setItem('biro_init_v4', Date.now());
                console.log('--- Neural_Layer_Initialized: Zero_Data_State ---');
              }
            } catch (e) {}
          })();
        `}} />
        <div className="relative min-h-screen">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
