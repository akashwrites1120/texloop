import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SWRConfig } from "swr";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TextShare Live - Real-time Text Collaboration",
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
      <body className={inter.className}>
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
