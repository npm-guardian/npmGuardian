import { LucideIcon, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

interface RiskCardProps {
  title: string;
  value: string;
  trend: string;
  status: 'success' | 'danger' | 'neutral';
}

export default function RiskCard({ title, value, trend, status }: RiskCardProps) {
  const statusColors = {
    success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    danger: 'border-red-500/50 bg-red-500/10 text-red-400',
    neutral: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
  };

  const Icon = status === 'success' ? ShieldCheck : status === 'danger' ? ShieldAlert : Activity;

  return (
    <div className={`p-6 rounded-xl border ${statusColors[status]} backdrop-blur-sm flex flex-col gap-4`}>
        <div className="flex justify-between items-center">
            <h3 className="text-zinc-300 font-medium">{title}</h3>
            <Icon size={20} className="opacity-80" />
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-sm opacity-70">{trend}</span>
        </div>
    </div>
  );
}
