import Image from "next/image";
import Link from "next/link";

// Interim compact lockup cut from the supplied brand poster. A production
// vector logo is still required (see README "compact production logo").
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="HomeBEZ home" className="flex shrink-0 items-center gap-2 rounded-md">
      <Image src="/brand/homebez-symbol.png" alt="" width={40} height={40} priority className="size-9 lg:size-10" />
      {!compact && (
        <Image
          src="/brand/homebez-wordmark.png"
          alt=""
          width={568}
          height={96}
          priority
          className="h-5 w-auto lg:h-6"
        />
      )}
    </Link>
  );
}
