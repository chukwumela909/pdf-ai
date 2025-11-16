import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Stack_Sans_Notch } from "next/font/google";
import "./globals.css";

const stackSans = Stack_Sans_Notch({
  variable: "--font-stack-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const garamond = localFont({
  src: "../public/itc-garamond-std.otf",
  variable: "--font-milimo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Milimo.ai",
  description: "From my heart to yours, Milimo.ai reimagines PDF understanding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${stackSans.variable} ${inter.variable} ${garamond.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
