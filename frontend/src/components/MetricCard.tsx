import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "mint" | "gold" | "coral" | "ink";
}

const toneClass = {
  mint: "border-mint/30 bg-mint/5 text-mint",
  gold: "border-gold/30 bg-gold/5 text-gold",
  coral: "border-coral/30 bg-coral/5 text-coral",
  ink: "border-ink/20 bg-ink/5 text-ink"
};

export function MetricCard({ icon: Icon, label, value, tone }: MetricCardProps) {
  return (
    <section className={`rounded-lg border p-4 ${toneClass[tone]}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <strong className="mt-3 block text-2xl text-ink">{value}</strong>
    </section>
  );
}
