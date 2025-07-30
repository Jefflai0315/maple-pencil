import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./App.css";
import Providers from "./Providers";

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
      { url: "/jeff-face.png", sizes: "any" },
      { url: "/jeff-face.png", sizes: "110x110", type: "image/png" },
      { url: "/jeff-182x182.png", sizes: "182x182", type: "image/png" },
      { url: "/jeff.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/jeff-182x182.png", sizes: "182x182", type: "image/png" }],
    shortcut: "/jeff-face.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jeff Lai",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Jeff Lai" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* <link
          rel="icon"
          href="/jeff-face.png"
          type="image/png"
          sizes="110x110"
        /> */}
        {/* <link rel="apple-touch-icon" href="/jeff-182x182.png" /> */}
        <link rel="manifest" href="/manifest.json" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://aframe.io/releases/1.2.0/aframe.min.js"
          async
        ></script>
        <script
          src="https://cdn.rawgit.com/jeromeetienne/AR.js/2.1.7/aframe/build/aframe-ar.js"
          async
        ></script>

        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-X5Z5VS5MBS"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-X5Z5VS5MBS');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
