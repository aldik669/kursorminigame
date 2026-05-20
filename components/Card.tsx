import type { HTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    tone?: "glass" | "solid";
  }
>;

export function Card({ children, className, tone = "glass", ...rest }: Props) {
  const base = "rounded-3xl shadow-glow";
  const tones =
    tone === "glass"
      ? "bg-white/10 border border-white/10 backdrop-blur"
      : "bg-slate-950/40 border border-white/10";

  return (
    <div className={[base, tones, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

