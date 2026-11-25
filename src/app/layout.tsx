import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Sans_3, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f7f3ea",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Aphros — Descubre tu rutina de piel",
  description:
    "Test de piel Aphros: responde unas preguntas y recibe recomendaciones de cosmética artesanal guatemalteca.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", display.variable, body.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col aphros-grain">{children}</body>
    </html>
  );
}
