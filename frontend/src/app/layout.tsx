import type { Metadata } from "next";
import { Inter, Outfit, Fredoka } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "LicitFlow - Gestão de Licitações",
  description: "Sistema de gerenciamento de Atas de Registro de Preços e Reservas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${outfit.variable} ${fredoka.variable} h-full`}
    >
      <body className="h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}


