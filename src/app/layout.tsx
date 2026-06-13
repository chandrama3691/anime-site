import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnimeStream",
  description: "Your premium anime streaming destination",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-white`}>
        {/* Navbar sits at the very top of the app */}
        <Navbar />
        
        {/* The pt-16 (padding-top) pushes the page content down 
           so it starts below the fixed navigation bar.
        */}
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}