import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "glisse/styles.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PotatoWatch",
  description: "Movies, TV shows, K-Dramas, and anime in one place.",
  icons: {
    icon: "/potato-mascot.svg",
    apple: "/potato-mascot.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#080b10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://vidlink.pro" />
        <link rel="preconnect" href="https://vidfast.pro" />
        <link rel="preconnect" href="https://vidnest.fun" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#080b10] text-[#f4f7fb] selection:bg-[#38bdf8] selection:text-[#07131a]"
      >
        {children}
      </body>
    </html>
  );
}
