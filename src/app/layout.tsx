import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { RootProviders } from "@/components/layout/RootProviders";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorLoggerInit } from "@/components/ErrorLoggerInit";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  icons: {
    icon: "/AuraRank-Squared.png",
    apple: "/AuraRank-Squared.png",
  },
  title: {
    template: "%s | AuraRank",
    default: "AuraRank — Post. Get Ranked. Build Your Aura.",
  },
  description:
    "Post your best moments. Let the internet rate your aura score. Build your AuraRank, compete in global rankings, and discover where you stand.",
  keywords: [
    "aura score",
    "aura rank",
    "social rating platform",
    "post ranking",
    "rate my vibe",
    "aura competition",
    "build your aura",
    "social gaming",
    "aura leaderboard",
    "get rated",
    "online ranking",
    "aura points",
  ],
  metadataBase: new URL("https://aurarank.me"),
  openGraph: {
    siteName: "AuraRank",
    type: "website",
    url: "https://aurarank.me",
    title: "AuraRank — Post. Get Ranked. Build Your Aura.",
    description:
      "Post your best moments. Let the internet rate your aura score. Compete in global rankings.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "AuraRank" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraRank — Post. Get Ranked. Build Your Aura.",
    description:
      "Post your best moments. Let the internet rate your aura score. Compete in global rankings.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <RootProviders>
          <ErrorLoggerInit />
          {children}
          <ToastContainer />
        </RootProviders>
        <Script
          src="https://analytics.weblify.me/script.js"
          data-website-id="641105b7-6a44-4361-8ede-c619fd5d03a3"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
