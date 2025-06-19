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
  title: "Jeff Lai",
  description: "Playing with pencil and art",
  icons: {
    icon: [
      { url: "/jeff-face.png", sizes: "110x110", type: "image/png" },
      { url: "/jeff-182x182.png", sizes: "182x182", type: "image/png" },
      { url: "/jeff.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/jeff-182x182.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
