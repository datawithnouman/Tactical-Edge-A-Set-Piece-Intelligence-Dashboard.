'use client';

type KpiCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
};

export default function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-primary/10 transition hover:border-primary/40">
      <p className="text-xs uppercase tracking-widest text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
    </div>
  );
}
