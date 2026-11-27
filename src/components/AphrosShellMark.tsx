import Image from "next/image";
import { cn } from "@/lib/utils";

type AphrosShellMarkProps = {
  className?: string;
  variant?: "dark" | "light";
  priority?: boolean;
};

/**
 * Isotipo oficial de concha marina Aphros usando las imágenes de marca.
 * - variant "dark": marrón/espresso (para fondos claros)
 * - variant "light": rosa crema/blush (para fondos oscuros / borgoña)
 */
export function AphrosShellMark({
  className,
  variant = "dark",
  priority,
}: AphrosShellMarkProps) {
  const src =
    variant === "light"
      ? "/brand/shell-light.png"
      : "/brand/shell-dark.png";

  return (
    <span className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <Image
        src={src}
        alt="Aphros"
        width={958}
        height={662}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

/**
 * Logotipo tipográfico oficial APHROS con la ligadura de la A-P.
 */
export function AphrosWordmark({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <Image
        src="/brand/logo-dark.png"
        alt="APHROS"
        width={1058}
        height={412}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

/**
 * Imagotipo completo claro (concha + APHROS) para tarjetas oscuras.
 */
export function AphrosFullLogoLight({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <Image
        src="/brand/logo-full-light.png"
        alt="APHROS"
        width={1058}
        height={860}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
