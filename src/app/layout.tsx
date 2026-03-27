import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evalyzer - CA Test Series Engine & Evaluation Platform",
  description: "Comprehensive CA exam preparation and evaluation platform with smart analytics and AI-powered insights",
  keywords: ["CA", "Chartered Accountant", "Exam", "Evaluation", "Test Series", "Analytics"],
  authors: [{ name: "Evalyzer Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Evalyzer - CA Test Series Engine",
    description: "Smart evaluation platform for CA students with performance analytics",
    url: "https://chat.z.ai",
    siteName: "Evalyzer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evalyzer - CA Test Series Engine",
    description: "Smart evaluation platform for CA students",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
