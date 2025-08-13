import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HVAC Pro - Sistema de Gestão de Manutenção",
  description: "Sistema completo para gestão de manutenção HVAC e PMOC conforme Lei nº 13.589/2018",
  keywords: ["HVAC", "Manutenção", "PMOC", "Ar Condicionado", "Lei 13.589/2018", "Gestão"],
  authors: [{ name: "HVAC Pro Team" }],
  openGraph: {
    title: "HVAC Pro - Sistema de Gestão de Manutenção",
    description: "Sistema completo para gestão de manutenção HVAC e PMOC conforme Lei nº 13.589/2018",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
