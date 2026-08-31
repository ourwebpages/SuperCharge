import type { Metadata, Viewport } from "next";
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
  title: {
    default: "SuperCharge — Interactive 3D Studio",
    template: "%s | SuperCharge",
  },
  description:
    "SuperCharge crafts immersive digital experiences using real-time 3D, motion design, and thoughtful engineering. Interactive WebGL experiences that move people.",
  keywords: [
    "3D web experiences",
    "WebGL",
    "React Three Fiber",
    "interactive design",
    "digital studio",
    "motion design",
    "real-time 3D",
    "immersive web",
  ],
  authors: [{ name: "SuperCharge" }],
  creator: "SuperCharge",
  publisher: "SuperCharge",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://supercharge.studio",
    siteName: "SuperCharge",
    title: "SuperCharge — Interactive 3D Studio",
    description:
      "Crafting immersive digital experiences using real-time 3D, motion design, and thoughtful engineering.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SuperCharge — Interactive 3D Studio",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "SuperCharge — Interactive 3D Studio",
    description:
      "Crafting immersive digital experiences using real-time 3D, motion design, and thoughtful engineering.",
    images: ["/og-image.png"],
    creator: "@supercharge",
  },

  // Favicon
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Misc
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://supercharge.studio",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to external origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}
