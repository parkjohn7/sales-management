import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "mint" | "gold" | "coral" | "ink";
}

const toneClass = {
  mint: "from-emerald-50 to-white text-emerald-700 ring-emerald-100",
  gold: "from-amber-50 to-white text-amber-700 ring-amber-100",
  coral: "from-rose-50 to-white text-rose-700 ring-rose-100",
  ink: "from-slate-100 to-white text-slate-700 ring-slate-200"
};

export function MetricCard({ icon: Icon, label, value, tone }: MetricCardProps) {
  return (
    <section className={`rounded-lg bg-gradient-to-br p-4 shadow-sm ring-1 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <span className="rounded-md bg-white p-2 shadow-sm ring-1 ring-black/5">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <strong className="mt-4 block text-2xl text-slate-950">{value}</strong>
    </section>
  );
}
