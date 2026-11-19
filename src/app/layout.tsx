import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/lib/authContext";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "FetoAI — Unified Intelligence for Research, Code & Data",
  description:
    "Production-grade commercial AI SaaS. Unified frontier intelligence featuring Live Web Synthesis, Hybrid Document RAG, Python Sandbox & Charts, and Multimodal Vision.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="font-sans antialiased min-h-screen bg-black text-white selection:bg-neutral-800 selection:text-white transition-colors duration-200"
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
