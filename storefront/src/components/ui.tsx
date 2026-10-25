import Link from "next/link";
import {
  BadgeCheck,
  Bed,
  CheckCircle2,
  Circle,
  Clock,
  Gem,
  Glasses,
  Headphones,
  Lamp,
  Brush,
  Loader2,
  PackageCheck,

  Shirt,
  ShoppingBag,
  Sofa,
  Speaker,
  SprayCan,
  Star,
  Truck,
  UsbIcon,
  Watch,
  Coffee,
  Footprints,
  XCircle,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import type { ArtKind } from "@/lib/data";
import { categoryArt, formatPrice } from "@/lib/data";

/* ---------- Buttons ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-hb transition-colors select-none disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-hover active:translate-y-px disabled:bg-surface-muted disabled:text-ink-secondary aria-disabled:bg-surface-muted aria-disabled:text-ink-secondary",
  secondary:
    "bg-surface text-ink border border-control hover:bg-surface-muted active:translate-y-px disabled:text-ink-secondary disabled:border-border",
  ghost: "text-ink hover:bg-surface-muted disabled:text-ink-secondary",
  danger: "bg-surface text-danger border border-danger hover:bg-danger-soft",
};
const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
    >
      {loading && <Loader2 aria-hidden className="size-4" style={{ animation: "hb-spin 0.8s linear infinite" }} />}
      {children}
    </button>
  );
}

/* ---------- Product art (placeholder photography) ---------- */

const artIcons: Record<ArtKind, LucideIcon> = {
  shirt: Shirt,
  dress: Shirt,
  shoe: Footprints,
  bag: ShoppingBag,
  perfume: SprayCan,
  lipstick: Brush,
  ring: Gem,
  watch: Watch,
  glasses: Glasses,
  headphones: Headphones,
  cable: UsbIcon,
  speaker: Speaker,
  lamp: Lamp,
  sofa: Sofa,
  cup: Coffee,
  bed: Bed,
};

export function ProductArt({
  kind,
  tone,
  angle = 0,
  className = "",
  label,
}: {
  kind: ArtKind;
  tone: string;
  angle?: number;
  className?: string;
  label?: string;
}) {
  const Icon = artIcons[kind];
  const transforms = ["", "rotate(-12deg) scale(0.9)", "scale(1.35) translate(8%, 6%)", "rotate(10deg) scale(0.8)"];
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      className={`relative grid aspect-square place-items-center overflow-hidden bg-surface-muted ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full opacity-70"
        style={{ background: `radial-gradient(circle at 40% 35%, #fff 0%, ${tone} 70%)` }}
      />
      <Icon
        aria-hidden
        strokeWidth={1.25}
        className="relative size-[46%] text-ink/70"
        style={{ transform: transforms[angle % transforms.length] }}
      />
    </div>
  );
}

/** Seller photo when there is one, otherwise category placeholder art. */
export function ProductImage({
  src,
  category,
  alt,
  className = "",
  angle = 0,
}: {
  src?: string | null;
  category: string;
  alt: string;
  className?: string;
  angle?: number;
}) {
  if (src) {
    return (
      <div className={`relative aspect-square overflow-hidden bg-surface-muted ${className}`}>
        {/* Arbitrary seller-hosted URLs, so a plain img rather than next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" decoding="async" className="size-full object-contain" />
      </div>
    );
  }
  const { kind, tone } = categoryArt(category);
  return <ProductArt kind={kind} tone={tone} angle={angle} className={className} label={alt || undefined} />;
}

/* ---------- Price ---------- */

export function Price({
  price,
  compareAt,
  size = "card",
}: {
  price: number;
  compareAt?: number;
  size?: "card" | "detail" | "inline";
}) {
  const pct = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const main =
    size === "detail"
      ? "text-[24px] leading-8 lg:text-[28px] lg:leading-9"
      : size === "card"
        ? "text-[18px] leading-6 lg:text-[20px] lg:leading-7"
        : "text-base";
  // Products can be saved without a price; they show but can't be bought.
  if (price <= 0) return <p className="text-sm font-semibold text-ink-secondary">Price not set yet</p>;
  return (
    <div className="tabular flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-bold text-ink ${main}`}>{formatPrice(price)}</span>
      {pct > 0 && (
        <>
          <span className="text-xs text-ink-secondary line-through">
            <span className="sr-only">Was </span>
            {formatPrice(compareAt!)}
          </span>
          <span className="text-xs font-semibold text-gold-ink">−{pct}%</span>
        </>
      )}
    </div>
  );
}

/* ---------- Rating ---------- */

export function Rating({ value, count, compact = false }: { value?: number; count?: number; compact?: boolean }) {
  if (!value || !count) return compact ? null : <span className="text-xs text-ink-secondary">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-secondary">
      <Star aria-hidden className="size-3.5 fill-gold text-gold-ink" />
      <span className="font-semibold text-ink">{value.toFixed(1)}</span>
      <span>
        ({count.toLocaleString("en-PK")}
        <span className="sr-only"> reviews</span>)
      </span>
    </span>
  );
}

/* ---------- Trust badge ---------- */

export function TrustBadge({ verified, explanation }: { verified: boolean; explanation: string }) {
  return verified ? (
    <span className="inline-flex items-start gap-1.5 rounded-full bg-green-soft px-2.5 py-1 text-xs font-medium text-green">
      <BadgeCheck aria-hidden className="size-4 shrink-0" />
      <span>
        Verified store<span className="sr-only">: {explanation}</span>
      </span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-secondary">
      <Clock aria-hidden className="size-4" />
      {explanation}
    </span>
  );
}

/* ---------- Status label ---------- */

export type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";

export const statusMap: Record<OrderStatus, { label: string; Icon: LucideIcon; cls: string }> = {
  new: { label: "New", Icon: Clock, cls: "bg-gold-soft text-gold-ink" },
  confirmed: { label: "Confirmed", Icon: CheckCircle2, cls: "bg-green-soft text-green" },
  shipped: { label: "Shipped", Icon: Truck, cls: "bg-[#E8EEF8] text-info" },
  delivered: { label: "Delivered", Icon: PackageCheck, cls: "bg-green-soft text-green" },
  cancelled: { label: "Cancelled", Icon: XCircle, cls: "bg-danger-soft text-danger" },
};

export function StatusLabel({ status }: { status: OrderStatus }) {
  const { label, Icon, cls } = statusMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}

/* ---------- Stock line ---------- */

export function StockLine({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
        <XCircle aria-hidden className="size-3.5" /> Out of stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gold-ink">
        <ShieldAlert aria-hidden className="size-3.5" /> Only {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-green">
      <Circle aria-hidden className="size-2 fill-green" /> In stock
    </span>
  );
}

/* ---------- Section header ---------- */

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  id,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-[20px] font-bold leading-7 lg:text-[24px] lg:leading-8">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-md text-sm font-semibold text-gold-ink underline-offset-4 hover:underline"
        >
          {linkLabel}
          <span className="sr-only">: {title}</span>
        </Link>
      )}
    </div>
  );
}

/* ---------- Prototype notice ---------- */

export function IllustrativeNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-ink-secondary ${className}`}>
      Design prototype: prices, stock, stores and reviews shown are illustrative.
    </p>
  );
}
