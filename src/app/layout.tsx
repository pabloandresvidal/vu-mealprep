import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VU Mealprep Ai",
  description: "AI-driven meal prep planning and optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="app-container">
            <Navigation />
          <main className="main-content">
            {children}
          </main>
        </div>
        </Providers>
      </body>
    </html>
  );
}
