import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Set-Piece IQ",
  description: "Advanced set-piece analytics dashboard for soccer teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-200 antialiased">
        <Header />
        <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
