import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./App.css";
import "./playful.css";
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
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "Pencil",
  },
  formatDetection: {
    telephone: false,
  },
};

// Pinch-zoom stays allowed on normal pages (accessibility); the trace tool
// turns it off in its own layout because pinching resizes the picture there.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
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
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Fraunces:opsz,wght,SOFT@9..144,300..700,0..100&family=Shantell+Sans:wght@400;500;700&family=Sue+Ellen+Francisco&display=swap"
          rel="stylesheet"
        />

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
