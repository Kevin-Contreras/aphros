import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Isotipo oficial de Aphros (concha marina de 7 pétalos simétricos)
 * basado en el manual "Renovación Aphros".
 */
export function AphrosShellMark({
  className,
  strokeWidth = 2.4,
  ...props
}: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 120 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* Contorno festoneado exterior de 7 lóbulos */}
      <path
        d="M21 57
           C10 53 6 42 12 33
           C16 27 23 26 27 27
           C24 20 28 12 36 11
           C42 10 47 13 49 16
           C51 9 56 6 60 6
           C64 6 69 9 71 16
           C73 13 78 10 84 11
           C92 12 96 20 93 27
           C97 26 104 27 108 33
           C114 42 110 53 99 57
           C90 60 76 62 60 68
           C44 62 30 60 21 57 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Curva suave del borde inferior (base de la concha) */}
      <path
        d="M23 56 C37 52 49 55 60 62 C71 55 83 52 97 56"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Nervaduras radiales internas que convergen hacia el origen */}
      <path
        d="M60 15 V56"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.72}
        strokeLinecap="round"
      />
      <path
        d="M46 18 C49 31 53 43 58 55"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.72}
        strokeLinecap="round"
      />
      <path
        d="M74 18 C71 31 67 43 62 55"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.72}
        strokeLinecap="round"
      />
      <path
        d="M30 28 C37 37 46 46 55 54"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.72}
        strokeLinecap="round"
      />
      <path
        d="M90 28 C83 37 74 46 65 54"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.72}
        strokeLinecap="round"
      />
    </svg>
  );
}
