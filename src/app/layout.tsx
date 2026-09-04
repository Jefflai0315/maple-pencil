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
  title: "Playing with pencil - Jeff Lai | Artist & Engineer",
  description:
    "Interactive art experiences, live event sketch booths, and creative technology solutions. Bringing art and technology together through innovative digital experiences.",
  keywords: [
    "portrait art",
    "interactive art",
    "live sketching",
    "creative technology",
    "Jeff Lai",
    "Singapore artist",
    "traditional art",
    "mural art",
  ],
  authors: [{ name: "Jeff Lai" }],
  creator: "Jeff Lai",
  publisher: "Playing with pencil",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.playingwithpencil.art",
    siteName: "Playing with pencil",
    title: "Playing with pencil - Jeff Lai | Artist & Engineer",
    description:
      "Interactive art experiences, live event sketch booths, and creative technology solutions. Bringing art and technology together through innovative digital experiences.",
    images: [
      {
        url: "/sketch/cover_page.png",
        width: 1200,
        height: 630,
        alt: "Jeff Lai - Artist & Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playing with pencil - Jeff Lai | Artist & Engineer",
    description:
      "Interactive art experiences, live event sketch booths, and creative technology solutions.",
    images: ["/sketch/cover_page.png"],
    creator: "@jefflai",
  },
  icons: {
    icon: [
      { rel: "shortcut icon", url: "/favicon.svg" },
      { rel: "icon", url: "favicon-32x32.png", sizes: "32x32" },
      { rel: "icon", url: "favicon-16x16.png", sizes: "16x16" },
      { rel: "apple-touch-icon", url: "touch-icon-iphone.png" },
      {
        rel: "apple-touch-icon",
        url: "apple-touch-icon-152x152.png",
        sizes: "152x152",
      },
      {
        rel: "apple-touch-icon",
        url: "apple-touch-icon-180x180.png",
        sizes: "180x180",
      },
      {
        rel: "apple-touch-icon",
        url: "apple-touch-icon-167x167.png",
        sizes: "167x167",
      },
    ],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.playingwithpencil.art" />
        <meta
          property="og:title"
          content="Playing with pencil - Jeff Lai | Artist & Engineer"
        />
        <meta
          property="og:description"
          content="Interactive art experiences, live event sketch booths, and creative technology solutions. Bringing art and technology together through innovative digital experiences."
        />
        <meta
          property="og:image"
          content="https://www.playingwithpencil.art/sketch/cover_page.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Jeff Lai - Artist & Engineer" />
        <meta property="og:site_name" content="Playing with pencil" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.playingwithpencil.art" />
        <meta
          name="twitter:title"
          content="Playing with pencil - Jeff Lai | Artist & Engineer"
        />
        <meta
          name="twitter:description"
          content="Interactive art experiences, live event sketch booths, and creative technology solutions."
        />
        <meta
          name="twitter:image"
          content="https://www.playingwithpencil.art/sketch/cover_page.png"
        />
        <meta name="twitter:image:alt" content="Jeff Lai - Artist & Engineer" />
        <meta name="twitter:creator" content="@jefflai" />

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
        <noscript>
          <div style={{ padding: 12, background: '#fffbe6', color: '#5c4a00', textAlign: 'center' }}>
            JavaScript is disabled. The basic content is available, but interactive features require JavaScript.
          </div>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
