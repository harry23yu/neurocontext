import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "NeuroContext: Explain Implicit Language & Summarize Text with AI",
  description: "NeuroContext identifies and explains implicit language—including idioms, sarcasm, and figurative speech—in plain, literal terms. Summaries and key points are also included for long texts and PDFs.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  themeColor: "#4dd0c4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
