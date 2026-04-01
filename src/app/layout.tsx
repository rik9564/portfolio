import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/constants";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Agniva Chowdhury — QA Automation Engineer & Full-Stack Developer",
    template: "%s | Agniva Chowdhury",
  },
  description:
    "QA Automation Engineer with 4+ years building enterprise test frameworks (Selenium, Playwright, Cypress) and shipping full-stack products with Next.js, React & AI-powered workflows.",
  keywords: [
    "QA Automation Engineer",
    "Test Automation",
    "Selenium",
    "Playwright",
    "Cypress",
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "CI/CD",
    "GitHub Actions",
    "AI-Powered Development",
    "Agniva Chowdhury",
  ],
  authors: [{ name: "Agniva Chowdhury", url: SITE_URL }],
  creator: "Agniva Chowdhury",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Agniva Chowdhury — Portfolio",
    title: "Agniva Chowdhury — QA Automation Engineer & Full-Stack Developer",
    description:
      "I break software before users do. 4+ years building test frameworks that catch what humans miss — and shipping full-stack products with AI-powered workflows.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agniva Chowdhury — QA Automation Engineer & Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agniva Chowdhury — QA Automation Engineer & Full-Stack Developer",
    description:
      "I break software before users do. 4+ years building test frameworks that catch what humans miss.",
    images: ["/og-image.png"],
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
