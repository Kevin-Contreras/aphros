import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fcece6",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "APHROS — Eres arte y queremos cuidarte",
  description:
    "Test de piel Aphros: eres arte y queremos cuidarte. Responde unas preguntas y recibe tu rutina personalizada de amor propio y cosmética natural artesanal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full antialiased",
        display.variable,
        poppins.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col aphros-grain">{children}</body>
    </html>
  );
}
