import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CycleSight - 景氣循環與投資指標平台",
  description: "掌握景氣脈動，優化投資決策",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen text-slate-100 antialiased selection:bg-indigo-500/30`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="container mx-auto px-4 pt-24 pb-12">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
