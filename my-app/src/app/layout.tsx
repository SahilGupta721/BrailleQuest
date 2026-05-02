import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EchoSpell — learn its name, speak its name, defeat it",
  description:
    "A braille-first audio adventure. Travel seven worlds, learn each creature's name, and restore the light.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="h-[100dvh] overflow-hidden flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <div className="starfield pointer-events-none fixed inset-0 -z-10" />
        {children}
      </body>
    </html>
  );
}
