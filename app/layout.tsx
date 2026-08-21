import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SWRConfig } from "swr";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "TexLoop - Real-time Text Collaboration",
  description:
    "Share and collaborate on text in real-time with temporary rooms. No signup required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} font-sans`}
      >
        <SWRConfig
          value={{
            refreshInterval: 0,
            revalidateOnFocus: false,
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
