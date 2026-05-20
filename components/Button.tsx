import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
    size?: "lg" | "md";
    isLoading?: boolean;
  }
>;

export function Button({
  children,
  className,
  variant = "primary",
  size = "lg",
  isLoading,
  disabled,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "lg" ? "h-12 px-5 text-base" : "h-10 px-4 text-sm";
  const variants =
    variant === "primary"
      ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-glow hover:brightness-110"
      : "bg-white/10 hover:bg-white/15 border border-white/10";

  return (
    <button
      className={[base, sizes, variants, className].filter(Boolean).join(" ")}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>Сохраняем…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

