type Props = {
  value: number; // 0..1
};

export function ProgressBar({ value }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 border border-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-cyan-300 to-pink-400 transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

