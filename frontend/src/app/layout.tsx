import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Notes & Bookmarks Manager",
  description: "Organize your thoughts and favorite links in one beautiful place",
  keywords: ["notes", "bookmarks", "personal", "organization", "productivity"],
  authors: [{ name: "Personal Notes Manager" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-indigo-50 via-white to-emerald-50 min-h-screen`}
      >
        <div className="relative min-h-screen">
          {/* Background blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="blob blob-1 opacity-30"></div>
            <div className="blob blob-2 opacity-20"></div>
            <div className="blob blob-3 opacity-25"></div>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
