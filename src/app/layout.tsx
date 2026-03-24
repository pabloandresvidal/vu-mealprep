import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";

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
          <header className="navbar">
            <div className="logo">VU Mealprep</div>
            <nav className="nav-links">
              <a href="/dashboard">Dashboard</a>
              <a href="/recipes">Recipes</a>
              <a href="/plans">Meal Plans</a>
              <a href="/profile">Family</a>
              <button className="btn btn-primary">Sign In</button>
            </nav>
          </header>
          <main className="main-content">
            {children}
          </main>
        </div>
        </Providers>
      </body>
    </html>
  );
}
