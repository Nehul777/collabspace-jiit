import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#08090A",
};

export const metadata: Metadata = {
  title: {
    default: "CollabSpace JIIT | Find Your Dream Team",
    template: "%s | CollabSpace JIIT"
  },
  description: "The exclusive platform for Jaypee Institute of Information Technology (JIIT) students to network, pitch project ideas, find teammates, and build amazing projects together.",
  keywords: ["JIIT", "CollabSpace", "Jaypee Institute of Information Technology", "Student Projects", "Hackathon Teams", "JIIT Noida", "Project Matchmaking"],
  authors: [{ name: "CollabSpace JIIT" }],
  verification: {
    google: "-YgkUBPW9ZAXMsU61gqEsZEJ9hefvr8lMnLx1iCkgrA",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://collabspace-jiit.vercel.app/",
    siteName: "CollabSpace JIIT",
    title: "CollabSpace JIIT | Find Your Dream Team",
    description: "Connect with JIIT students, pitch project ideas, and build amazing projects together.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans bg-canvas text-text-primary antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
