import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./App.css";

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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/jeff-face.png", sizes: "110x110", type: "image/png" },
      { url: "/jeff-182x182.png", sizes: "182x182", type: "image/png" },
      { url: "/jeff.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/jeff-182x182.png", sizes: "182x182", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/jeff-face.png"
          type="image/png"
          sizes="110x110"
        />
        <link rel="apple-touch-icon" href="/jeff-182x182.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
