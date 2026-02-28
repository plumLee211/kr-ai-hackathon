import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "OOO's Adventure",
  description: "설문 기반 개인화 턴제 RPG — with Gemini Story Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pressStart2P.variable} overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
